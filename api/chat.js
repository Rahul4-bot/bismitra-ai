/**
 * Vercel Serverless Function: POST /api/chat
 * Secure server-side endpoint for BISMITRA AI knowledge retrieval and Gemini grounding.
 * Reads GEMINI_API_KEY strictly on the server-side.
 */

import { retrieveContext } from '../src/services/retrievalService.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_INSTRUCTION = `You are BISMITRA AI, an expert, official-grounded assistant for the Bureau of Indian Standards (BIS).
Your role is to assist manufacturers, consumers, and professionals with Indian Standards (IS codes), Quality Control Orders (QCOs), Scheme-I (ISI Mark), Scheme-II (CRS), Gold Hallmarking (HUID), Laboratory Testing, and Consumer Grievances.

LANGUAGE MATCHING:
- Write your answer in the SAME language and style as the user's query whenever reasonably possible.
- If the user writes in Hindi (Devanagari), answer in clear, natural Hindi.
- If the user writes in Hinglish (Hindi words written in Roman/English script), answer naturally in the same Hinglish style.
- If the user writes in English, answer in English.
- If the user writes in any other language Gemini fully understands, answer in that language where practical.
- If the query is ambiguous in language, default to English.

NEVER translate, alter, or transliterate official technical identifiers. Always keep them exactly as-is:
IS 302-2-3, IS 14543, IS 4151, IS 16102 Part 1, IS 1786, IS 1417, CM/L, HUID, BIS, NABL, LRS, QCO, Manakonline, BIS Care, and official document/source names when useful.
Example: keep "IS 4151" as "IS 4151" even in a Hindi answer, e.g. "Helmet ke liye applicable standard IS 4151 hai...".

CRITICAL INSTRUCTIONS:
1. Answer the user's question STRICTLY and ONLY using the provided VERIFIED CONTEXT below.
2. NEVER invent, hallucinate, or extrapolate Indian Standards (IS codes), clause numbers, testing requirements, or government notifications.
3. If the provided context does NOT contain enough verified information to answer the question reliably, you MUST say so clearly IN THE USER'S LANGUAGE, and MUST NOT fill the gap with unsupported general knowledge.
4. Maintain a clear, professional, and accessible tone. Avoid unnecessary jargon.
5. Always return a valid JSON object matching the requested schema.`;

// ---------------------------------------------------------------------------
// Lightweight server-side language detection for multilingual responses.
// Detects Hindi (Devanagari script), Hinglish (Hindi words in Roman script),
// or English. Pure ASCII English queries default to English.
// ---------------------------------------------------------------------------
const DEVANAGARI_RE = /[\u0900-\u097F\uA8E0-\uA8FF]/;

// Distinctive Hinglish / Hindi-in-Roman markers (rare in natural English).
const HINGLISH_MARKERS = [
  'kaise', 'kya', 'hai', 'hain', 'karu', 'karna', 'kro', 'karein', 'kaunsa',
  'kaun', 'mujhe', 'mera', 'meri', 'apne', 'aapka', 'apka', 'batao', 'btao',
  'bataiye', 'chahiye', 'sakta', 'sakte', 'karke', 'kiye', 'hota', 'hote',
  'nahi', 'raha', 'rahi', 'milega', 'sawaal', 'sawal', 'puchna', 'pucho',
  'kaam', 'cheez', 'bhi', 'aur', 'baare', 'bina', 'kaunse', 'kis', 'kisi',
  'liye', 'hoga', 'hogi', 'honge', 'ko', 'ke', 'ka', 'ki'
];

function detectQueryLanguage(query) {
  const q = (query || '').trim();
  if (!q) return 'en';
  if (DEVANAGARI_RE.test(q)) return 'hi';
  const tokens = q.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  let hits = 0;
  for (const token of tokens) {
    if (HINGLISH_MARKERS.includes(token)) hits++;
  }
  return hits >= 2 ? 'hinglish' : 'en';
}

const LANG_LABEL = { en: 'English', hi: 'Hindi', hinglish: 'Hinglish' };

const NOT_ENOUGH_INFO = {
  en: "I do not have enough verified information in the current BISMITRA knowledge base to answer this reliably. Please check the official BIS portal (bis.gov.in) or refine your question with a specific product or standard.",
  hi: "मुझे वर्तमान BISMITRA ज्ञान-आधार में इसका विश्वसनीय उत्तर देने के लिए पर्याप्त सत्यापित जानकारी नहीं मिली है। कृपया आधिकारिक BIS पोर्टल (bis.gov.in) देखें या अपना प्रश्न किसी विशिष्ट उत्पाद या मानक के साथ पूछें।",
  hinglish: "Isko reliable answer dene ke liye current BISMITRA knowledge base me itni verified information nahi hai. Kripya official BIS portal (bis.gov.in) check karein ya apna sawal kisi specific product ya standard ke saath pochein."
};

const NOT_ENOUGH_HINT = {
  en: "No matching verified Indian Standard or Gazette order found in the focused dataset.",
  hi: "फ़ोकस किए गए डेटा-सेट में कोई मेल खाता हुआ सत्यापित भारतीय मानक या गज़ट आदेश नहीं मिला।",
  hinglish: "Focused dataset me koi matching verified Indian Standard ya Gazette order nahi mila."
};

const NO_EXTRAPOLATION = {
  en: "To prevent misinformation, BISMITRA AI does not extrapolate unverified compliance requirements.",
  hi: "ग़लत जानकारी से बचने के लिए, BISMITRA AI असत्यापित अनुपालन आवश्यकताओं का अनुमान नहीं लगाता।",
  hinglish: "Galat jaankari rokne ke liye, BISMITRA AI unverified compliance requirements ka extrapolate nahi karta."
};

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

    // Detect the user's response language from the query itself.
    const lang = detectQueryLanguage(query);
    const madad = NOT_ENOUGH_INFO[lang];
    const hint = NOT_ENOUGH_HINT[lang];
    const noExtra = NO_EXTRAPOLATION[lang];

    // 2. Handle out of scope / insufficient context
    if (!hasSufficientContext || !formattedContext.trim()) {
      return res.status(200).json({
        id: 'msg-' + Date.now(),
        sender: 'bismitra',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `### ${detectedCategory}\n\n${madad}\n\n*Note: Information is based on the sources available in the BISMITRA prototype knowledge base. Requirements may change; please verify critical compliance decisions with official BIS sources.*`,
        rawAnswer: madad,
        keyPoints: [
          hint,
          noExtra,
          lang === 'en'
            ? "You can explore official publications on the BIS Manakonline portal."
            : (lang === 'hi'
                ? "आप BIS Manakonline पोर्टल पर आधिकारिक प्रकाशन देख सकते हैं।"
                : "Aap BIS Manakonline portal par official publications dekh sakte hain.")
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

DETECTED RESPONSE LANGUAGE: ${LANG_LABEL[lang]} (${lang})

VERIFIED BIS CONTEXT:
${formattedContext}

Instructions:
- Answer strictly based on the above VERIFIED BIS CONTEXT. Do NOT invent standards, numbers, fees, timelines, contacts, HUID results, or URLs.
- Respond in the DETECTED RESPONSE LANGUAGE (${LANG_LABEL[lang]}), matching the user's own language/style as closely as reasonably possible.
- NEVER translate or alter official technical identifiers such as IS numbers, CM/L, HUID, BIS, NABL, LRS, QCO, Manakonline, or BIS Care. Keep them exactly as they appear in the context.
- If the context does not contain enough verified information to answer reliably, state so clearly in the DETECTED RESPONSE LANGUAGE and do not fill gaps with unsupported general knowledge.
- Respond with a JSON object in this exact schema:
{
  "answer": "Clear, concise paragraph explaining the answer in the detected language.",
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
      aiAnswer = buildServerGroundedAnswer(retrievalResult, lang);
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

function buildProductAnswer(matchedProduct, lang) {
  const p = matchedProduct;
  if (lang === 'hi') {
    return `आपके उत्पाद **${p.product_name}** के लिए applicable भारतीय मानक **${p.possible_standard}** है। यह **${p.scheme_or_service}** के अंतर्गत आता है और यह ${p.mandatory_status} है। ${p.certification_guidance}`;
  }
  if (lang === 'hinglish') {
    return `Aapke product **${p.product_name}** ke liye applicable Indian Standard **${p.possible_standard}** hai. Yeh **${p.scheme_or_service}** ke under aata hai aur ${p.mandatory_status} hai. ${p.certification_guidance}`;
  }
  return `For **${p.product_name}**, the applicable Indian Standard is **${p.possible_standard}**. It is governed under **${p.scheme_or_service}** and is ${p.mandatory_status}. ${p.certification_guidance}`;
}

function buildKeyPoint(label, value, lang) {
  const labels = {
    'Applicable Standard':  { hi: 'Applicable Standard',  hinglish: 'Applicable Standard' },
    'Certification Scheme': { hi: 'Certification Scheme', hinglish: 'Certification Scheme' },
    'Mandatory Status':     { hi: 'Mandatory Status',     hinglish: 'Mandatory Status' }
  };
  const l = (labels[label] && labels[label][lang]) || label;
  return `${l}: ${value}`;
}

function buildServerGroundedAnswer(retrievalResult, lang) {
  const { matchedProduct, matchedDocs, detectedCategory } = retrievalResult;

  if (matchedProduct) {
    return {
      answer: buildProductAnswer(matchedProduct, lang),
      key_points: [
        buildKeyPoint('Applicable Standard', matchedProduct.possible_standard, lang),
        buildKeyPoint('Certification Scheme', matchedProduct.scheme_or_service, lang),
        buildKeyPoint('Mandatory Status', matchedProduct.mandatory_status, lang),
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
    answer: NOT_ENOUGH_INFO[lang] || NOT_ENOUGH_INFO.en,
    key_points: [lang === 'hi' ? "कोई मेल खाता हुआ रिकॉर्ड नहीं मिला।" : (lang === 'hinglish' ? "Koi matching record nahi mila." : "No matching record found.")],
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
