/**
 * Vercel Serverless Function: POST /api/chat
 * Secure server-side endpoint for BISMITRA AI knowledge retrieval and Gemini grounding.
 * Reads GEMINI_API_KEY strictly on the server-side.
 */

import { retrieveContext } from '../src/services/retrievalService.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_INSTRUCTION = `You are BISMITRA AI, an expert, official-grounded assistant for the Bureau of Indian Standards (BIS).
Your role is to assist manufacturers, consumers, and professionals with Indian Standards (IS codes), Quality Control Orders (QCOs), Scheme-I (ISI Mark), Scheme-II (CRS), Gold Hallmarking (HUID), Laboratory Testing, and Consumer Grievances.

CRITICAL INSTRUCTIONS:
1. Answer the user's question STRICTLY and ONLY using the provided VERIFIED CONTEXT below.
2. NEVER invent, hallucinate, or extrapolate Indian Standards (IS codes), clause numbers, testing requirements, or government notifications.
3. If the provided context does NOT contain enough verified information to answer the question reliably, you MUST state:
   "I do not have enough verified information in the current BISMITRA knowledge base to answer this reliably. Please check the official BIS source or refine your question."
4. Maintain a clear, professional, and accessible tone. Avoid unnecessary jargon.
5. Always return a valid JSON object matching the requested schema.`;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const query = (body.query || '').trim();

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }

    // 1. Server-side Retrieval against Dual-Layer Knowledge Base
    const retrievalResult = retrieveContext(query);
    const { formattedContext, sources, hasSufficientContext, matchedProduct, matchedDocs, detectedCategory, categoryId } = retrievalResult;

    // 2. Handle out of scope / insufficient context
    if (!hasSufficientContext || !formattedContext.trim()) {
      return res.status(200).json({
        id: 'msg-' + Date.now(),
        sender: 'bismitra',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `### ${detectedCategory}\n\nI do not have enough verified information in the current BISMITRA knowledge base to answer this reliably. Please check the official BIS portal (bis.gov.in) or refine your question with a specific product or standard.\n\n*Note: Information is based on the sources available in the BISMITRA prototype knowledge base. Requirements may change; please verify critical compliance decisions with official BIS sources.*`,
        rawAnswer: "I do not have enough verified information in the current BISMITRA knowledge base to answer this reliably. Please check the official BIS portal (bis.gov.in) or refine your question with a specific product or standard.",
        keyPoints: [
          "No matching verified Indian Standard or Gazette order found in the focused dataset.",
          "To prevent misinformation, BISMITRA AI does not extrapolate unverified compliance requirements.",
          "You can explore official publications on the BIS Manakonline portal."
        ],
        sources: [],
        confidence: "low",
        category: detectedCategory,
        matchedProduct: null,
        suggestedActions: getSuggestedActions(retrievalResult)
      });
    }

    // 3. Server-side Gemini API call with GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY || '';
    let aiAnswer = null;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const prompt = `USER QUESTION:
${query}

VERIFIED BIS CONTEXT:
${formattedContext}

Please answer the user's question strictly based on the above context.
Respond with a JSON object in this exact schema:
{
  "answer": "Clear, concise paragraph explaining the answer in simple language.",
  "key_points": ["Key point 1", "Key point 2", "Key point 3"],
  "confidence": "high"
}`;

        const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json'
            }
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            aiAnswer = JSON.parse(rawJson);
          }
        }
      } catch (geminiError) {
        console.error('Server-side Gemini API request error:', geminiError);
      }
    }

    // 4. Fallback to Server-side Local Grounded Synthesis if no API key or network error
    if (!aiAnswer) {
      aiAnswer = buildServerGroundedAnswer(retrievalResult);
    }

    // 5. Build Final Structured Response
    let formattedText = `### ${matchedProduct ? matchedProduct.product_name : detectedCategory}\n\n`;
    formattedText += `${aiAnswer.answer}\n\n`;

    if (aiAnswer.key_points && aiAnswer.key_points.length > 0) {
      formattedText += `**Key Points & Compliance Highlights:**\n`;
      aiAnswer.key_points.forEach(point => {
        formattedText += `- ${point}\n`;
      });
    }

    formattedText += `\n*Note: Information is based on the sources available in the BISMITRA prototype knowledge base. Requirements may change; please verify critical compliance decisions with official BIS sources.*`;

    return res.status(200).json({
      id: 'msg-' + Date.now(),
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: formattedText,
      rawAnswer: aiAnswer.answer,
      keyPoints: aiAnswer.key_points || [],
      sources: sources.map(s => ({
        title: s.document || s.source_name,
        docTitle: s.document,
        sourceType: s.source_name,
        clause: s.page_or_section,
        reference: s.page_or_section,
        url: s.url,
        status: s.verification_status === 'needs_verification' ? 'Pending Source Verification' : 'Verified Official Source'
      })),
      confidence: aiAnswer.confidence || 'high',
      category: detectedCategory,
      matchedProduct: matchedProduct || null,
      suggestedActions: getSuggestedActions(retrievalResult)
    });

  } catch (err) {
    console.error('API Error in /api/chat:', err);
    return res.status(500).json({ error: 'Internal server error processing chat request.' });
  }
}

function buildServerGroundedAnswer(retrievalResult) {
  const { matchedProduct, matchedDocs, detectedCategory } = retrievalResult;

  if (matchedProduct) {
    return {
      answer: `For **${matchedProduct.product_name}**, the applicable Indian Standard is **${matchedProduct.possible_standard}**. It is governed under **${matchedProduct.scheme_or_service}** and is ${matchedProduct.mandatory_status}. ${matchedProduct.certification_guidance}`,
      key_points: [
        `Applicable Standard: ${matchedProduct.possible_standard}`,
        `Certification Scheme: ${matchedProduct.scheme_or_service}`,
        `Mandatory Status: ${matchedProduct.mandatory_status}`,
        ...matchedProduct.important_notes.slice(0, 2)
      ],
      confidence: "high"
    };
  }

  if (matchedDocs && matchedDocs.length > 0) {
    const primaryDoc = matchedDocs[0];
    const secondaryDocs = matchedDocs.slice(1);
    const keyPoints = [
      `Primary Reference: ${primaryDoc.document_title} (${primaryDoc.section || `Page ${primaryDoc.page}`})`,
      `Domain: ${detectedCategory} — ${primaryDoc.title}`
    ];
    if (secondaryDocs.length > 0) {
      keyPoints.push(`Related Provision: ${secondaryDocs[0].title}`);
    }

    return {
      answer: primaryDoc.content,
      key_points: keyPoints,
      confidence: "high"
    };
  }

  return {
    answer: "I do not have enough verified information in the current BISMITRA knowledge base to answer this reliably.",
    key_points: ["No matching record found."],
    confidence: "low"
  };
}

function getSuggestedActions(retrievalResult) {
  const { categoryId, matchedProduct } = retrievalResult;

  if (matchedProduct) {
    return [
      { label: `View Compliance Roadmap (${matchedProduct.product_name})`, targetTab: 'certification', payload: { product: matchedProduct.product_name, standard: matchedProduct.possible_standard } },
      { label: 'Find Approved Testing Labs', targetTab: 'labs', payload: { category: matchedProduct.category } },
      { label: 'Search Similar Standards', targetTab: 'find-standard', payload: { product: matchedProduct.product_name } }
    ];
  }

  switch (categoryId) {
    case 'certification':
      return [
        { label: 'Interactive 7-Step Roadmap', targetTab: 'certification' },
        { label: 'Find Approved Testing Labs', targetTab: 'labs' },
        { label: 'Verify ISI Mark Details', targetTab: 'consumer', payload: { mode: 'isi' } }
      ];
    case 'hallmarking':
      return [
        { label: 'Open Hallmarking Portal', targetTab: 'hallmarking' },
        { label: 'Verify HUID 6-Digit Code', targetTab: 'hallmarking', payload: { mode: 'huid' } },
        { label: 'Consumer Jewellery Rights', targetTab: 'consumer' }
      ];
    case 'crs':
      return [
        { label: 'Browse CRS Notified Categories', targetTab: 'find-standard', payload: { scheme: 'CRS' } },
        { label: 'Find Electronics Testing Labs', targetTab: 'labs', payload: { category: 'Electronics & IT' } }
      ];
    case 'consumer':
      return [
        { label: 'Open Consumer Help Center', targetTab: 'consumer' },
        { label: 'Verify ISI License (CM/L)', targetTab: 'consumer', payload: { mode: 'isi' } }
      ];
    case 'testing':
      return [
        { label: 'Explore Testing Labs Directory', targetTab: 'labs' },
        { label: 'View 7-Step Certification Guide', targetTab: 'certification' }
      ];
    default:
      return [
        { label: 'Find Standard for My Product', targetTab: 'find-standard' },
        { label: 'Explore 7-Step Certification Guide', targetTab: 'certification' },
        { label: 'Browse Testing Laboratories', targetTab: 'labs' }
      ];
  }
}
