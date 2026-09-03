/**
 * Vercel Serverless Function: POST /api/verify-product
 * Looks up a scanned identifier against the connected BIS knowledge base
 * (and isolated demo records). Optional Gemini explanation uses only
 * structured facts already retrieved — never as a source of BIS data.
 */

import {
  verifyProductScan,
  buildFallbackExplanation
} from '../src/services/productJourneyEngine.js';
import { UNAVAILABLE } from '../src/constants/productJourney.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_INSTRUCTION = `You are BISMITRA. Rewrite the provided STRUCTURED FACTS into a short consumer-friendly explanation.
CRITICAL: Use ONLY the facts given. Never invent BIS standards, licence numbers, manufacturers, dates, or test results.
If a field is missing, say it is not available in the connected BIS data.
If dataSource is demo, you MUST say this is demo data, not an official BIS record.
Respond with JSON: { "explanation": "..." }`;

async function optionalGeminiExplanation(facts) {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey.trim()) return null;

  try {
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `STRUCTURED FACTS:\n${JSON.stringify(facts)}\n\nWrite 2-4 short sentences for a consumer.`
              }
            ]
          }
        ],
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiRes.ok) return null;
    const data = await geminiRes.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) return null;
    const parsed = JSON.parse(rawJson);
    return typeof parsed.explanation === 'string' ? parsed.explanation : null;
  } catch (err) {
    console.error('Optional Gemini explanation failed:', err);
    return null;
  }
}

function explanationFacts(result) {
  const j = result.journey;
  if (!j) {
    return {
      dataSource: 'none',
      verificationStatus: 'NOT_FOUND',
      note: result.message
    };
  }
  return {
    dataSource: j.dataSource,
    productName: j.productName,
    productId: j.productId,
    manufacturer: j.manufacturer,
    category: j.category,
    standard: j.applicableStandards?.[0]?.code || UNAVAILABLE,
    certificationStatus: j.bisStatus,
    verificationStatus: j.verification?.status,
    matchedFields: j.verification?.matchedFields,
    missingFields: j.verification?.missingFields,
    demoDisclaimer: j.demoDisclaimer || null
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const scanValue = body.scanValue;
    const selectedRecordId = body.selectedRecordId || null;

    const result = verifyProductScan({ scanValue, selectedRecordId });

    let explanation = result.explanation || buildFallbackExplanation(result.journey);
    let explanationProvider = 'fallback';

    if (result.ok && result.journey && !result.multiple) {
      const aiText = await optionalGeminiExplanation(explanationFacts(result));
      if (aiText) {
        explanation = aiText;
        explanationProvider = 'gemini';
      }
    }

    return res.status(200).json({
      ...result,
      explanation,
      explanationProvider,
      unavailableLabel: UNAVAILABLE
    });
  } catch (err) {
    console.error('API Error in /api/verify-product:', err);
    return res.status(500).json({
      ok: false,
      errorCode: 'server',
      message: 'Unable to retrieve BIS information right now. Please try again or enter the product identifier manually.',
      journey: null,
      candidates: []
    });
  }
}
