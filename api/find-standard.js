/**
 * Vercel Serverless Function: POST /api/find-standard
 * Accepts a natural-language product description, matches it against the
 * connected BIS knowledge base, and returns the most relevant Indian Standard.
 * Optional Gemini call provides a human-friendly explanation — never BIS data.
 */

import {
  searchStructuredProducts,
  retrieveContext
} from '../src/services/retrievalService.js';
import standardsData from '../src/data/standards.json' with { type: 'json' };

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_INSTRUCTION = `You are BISMITRA AI, an expert assistant for Indian Standards (BIS).
Given a product description and the matched BIS standard data, produce a brief, consumer-friendly explanation of WHY this standard was recommended.
Use ONLY the facts provided. Never invent standards, clause numbers, or test names.
Return valid JSON: { "explanation": "...", "matchingFactors": ["factor1", "factor2"] }`;

/**
 * Extract simple product attributes from the user's input text.
 * Returns only attributes that can actually be inferred from the text.
 */
function extractProductAttributes(input) {
  const lower = input.toLowerCase();
  const attributes = {};

  // Material detection
  const materials = [
    { pattern: /stainless\s*steel/i, name: 'Stainless Steel' },
    { pattern: /steel/i, name: 'Steel' },
    { pattern: /aluminium|aluminum/i, name: 'Aluminium' },
    { pattern: /copper/i, name: 'Copper' },
    { pattern: /plastic/i, name: 'Plastic' },
    { pattern: /glass/i, name: 'Glass' },
    { pattern: /rubber/i, name: 'Rubber' },
    { pattern: /cement/i, name: 'Cement' },
    { pattern: /gold/i, name: 'Gold' },
    { pattern: /silver/i, name: 'Silver' },
  ];
  for (const m of materials) {
    if (m.pattern.test(lower)) {
      attributes.material = m.name;
      break;
    }
  }

  // Capacity / Size
  const capacityMatch = lower.match(/(\d+(?:\.\d+)?)\s*(litre|liter|ml|kg|gram|gm|ton|mm|cm|metre|meter|inch|kw|watt|w|volt|v|hp)\b/i);
  if (capacityMatch) {
    attributes.capacity = `${capacityMatch[1]} ${capacityMatch[2]}`;
  }

  // Intended use
  const usePatterns = [
    { pattern: /household|domestic|home/i, use: 'Household / Domestic' },
    { pattern: /industrial|factory|commercial/i, use: 'Industrial / Commercial' },
    { pattern: /construction|building/i, use: 'Construction' },
    { pattern: /food|drinking|water|beverage/i, use: 'Food & Beverages' },
    { pattern: /safety|protective/i, use: 'Safety / Protection' },
    { pattern: /lighting|light|lamp/i, use: 'Lighting' },
    { pattern: /electrical|electric|power/i, use: 'Electrical' },
  ];
  for (const u of usePatterns) {
    if (u.pattern.test(lower)) {
      attributes.intendedUse = u.use;
      break;
    }
  }

  return attributes;
}

/**
 * Calculate a relevance score (0-100) between a product search result
 * and the standards database. This is a simple prototype scorer that
 * can later be replaced with a proper retrieval/ranking algorithm.
 */
function calculateRelevance(matchedProduct, inputText, attributes) {
  if (!matchedProduct) return 0;

  const lower = inputText.toLowerCase();

  // Base confidence for a confirmed product-identity match against the
  // knowledge base with an associated verified standard. The caller has
  // already gated on isConfidentMatch(), so a match here is genuine.
  let score = 70;

  // Bonus when the product name appears verbatim in the input
  const nameLower = matchedProduct.product_name.toLowerCase();
  if (lower.includes(nameLower)) {
    score += 8;
  }

  // Attribute bonuses when the caller's extracted attributes are present
  if (attributes.material) {
    const matLower = attributes.material.toLowerCase();
    if (lower.includes(matLower) || (matchedProduct.description && matchedProduct.description.toLowerCase().includes(matLower))) {
      score += 5;
    }
  }

  if (attributes.capacity && lower.includes(attributes.capacity.toLowerCase())) {
    score += 5;
  }

  if (attributes.intendedUse) {
    const useLower = attributes.intendedUse.toLowerCase();
    if (lower.includes(useLower) || (matchedProduct.description && matchedProduct.description.toLowerCase().includes(useLower))) {
      score += 5;
    }
  }

  // Scheme/mandatory info present adds confidence
  if (matchedProduct.scheme_or_service || matchedProduct.mandatory_status) {
    score += 5;
  }

  return Math.min(Math.round(score), 98);
}

/**
 * Identify matching factors from the data.
 */
function identifyMatchingFactors(matchedProduct, inputText, attributes) {
  const factors = [];
  const lower = inputText.toLowerCase();

  if (matchedProduct.product_name) {
    const nameTokens = matchedProduct.product_name.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (nameTokens.some(t => lower.includes(t))) {
      factors.push('Product type');
    }
  }

  if (matchedProduct.category) {
    factors.push('Product category');
  }

  if (attributes.material) {
    factors.push('Material');
  }

  if (attributes.intendedUse) {
    factors.push('Intended use');
  }

  if (attributes.capacity) {
    factors.push('Capacity / Size');
  }

  if (matchedProduct.mandatory_status) {
    factors.push('BIS regulatory information');
  }

  return factors;
}

/**
 * Determines whether a matched product is a CONFIDENT match for the input,
 * based on product-identity keyword overlap. This prevents generic attribute
 * words (e.g. "steel") from producing misleading recommendations for products
 * that are not actually present in the knowledge base (e.g. a pressure cooker
 * matched to steel rebar standards because it contains the word "steel").
 */
function isConfidentMatch(matchedProduct, inputText) {
  if (!matchedProduct) return false;

  // Stop words that are generic attributes, not product identity
  const genericTokens = new Set([
    'steel', 'stainless', 'stainless-steel', 'aluminium', 'aluminum', 'copper',
    'plastic', 'glass', 'rubber', 'household', 'domestic', 'home', 'electrical',
    'electric', 'safety', 'size', 'capacity', 'litre', 'liter', 'big', 'small',
    'large', 'twin', 'double', 'heavy', 'light', 'industrial', 'commercial'
  ]);

  const lower = inputText.toLowerCase();
  const nameTokens = tokenizeProductName(matchedProduct.product_name);

  // Require at least one distinctive product-name token present in the query
  for (const token of nameTokens) {
    if (genericTokens.has(token)) continue;
    if (lower.includes(token)) {
      return true;
    }
  }

  return false;
}

function tokenizeProductName(name) {
  if (!name) return [];
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 2);
}

/**
 * Find matching standards from the standards.json using product data.
 */
function findMatchingStandards(matchedProduct, inputText) {
  if (!matchedProduct) return [];

  const standards = [];
  const productStandard = matchedProduct.possible_standard;

  // Find the primary standard from standards.json
  for (const std of standardsData) {
    if (std.standardNumber === productStandard) {
      standards.push(std);
      break;
    }
  }

  // Also find any other standards that might apply to the same category
  if (matchedProduct.category) {
    for (const std of standardsData) {
      if (std.standardNumber !== productStandard && std.category === matchedProduct.category) {
        standards.push(std);
      }
    }
  }

  return standards;
}

/**
 * Optional Gemini explanation using existing API key.
 */
async function optionalGeminiExplanation(productDescription, matchedProduct, matchingFactors) {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey.trim()) return null;

  try {
    const prompt = `PRODUCT DESCRIPTION: "${productDescription}"

MATCHED STANDARD: ${matchedProduct.possible_standard}
PRODUCT NAME: ${matchedProduct.product_name}
CATEGORY: ${matchedProduct.category}
SCHEME: ${matchedProduct.scheme_or_service}
MANDATORY STATUS: ${matchedProduct.mandatory_status}
MATCHING FACTORS: ${matchingFactors.join(', ')}

Write a brief 2-3 sentence explanation of why this standard was recommended for this product. Be clear and consumer-friendly.`;

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

    if (!geminiRes.ok) return null;
    const data = await geminiRes.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) return null;
    const parsed = JSON.parse(rawJson);
    return {
      explanation: parsed.explanation || null,
      matchingFactors: Array.isArray(parsed.matchingFactors) ? parsed.matchingFactors : matchingFactors
    };
  } catch (err) {
    console.error('Gemini explanation failed:', err);
    return null;
  }
}

/**
 * Build a local fallback explanation when Gemini is unavailable.
 */
function buildLocalExplanation(matchedProduct, matchingFactors, inputText) {
  const factorsList = matchingFactors.length > 0
    ? matchingFactors.map(f => `✓ ${f}`).join('\n')
    : '✓ Product type\n✓ Product category';

  return `Your product description matches the product scope and characteristics associated with **${matchedProduct.possible_standard}**.

This standard covers **${matchedProduct.product_name || 'this product type'}** under the **${matchedProduct.category || 'applicable category'}** category.

**Matching factors:**
${factorsList}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const productDescription = (body.productDescription || '').trim();

    if (!productDescription) {
      return res.status(400).json({
        ok: false,
        error: 'productDescription parameter is required.'
      });
    }

    // 1. Extract product attributes from the input
    const attributes = extractProductAttributes(productDescription);

    // 2. Search the knowledge base for a matching product
    const matchedProduct = searchStructuredProducts(productDescription);

    // 3. Require a confident product-identity match; otherwise treat as no-match
    //    to avoid recommending a standard for a product not in the knowledge base.
    if (!matchedProduct || !isConfidentMatch(matchedProduct, productDescription)) {
      return res.status(200).json({
        ok: true,
        found: false,
        input: productDescription,
        extractedAttributes: attributes,
        message: 'No matching standard found in the current BISMITRA knowledge base.',
        suggestion: 'Try adding more details such as:\n• Product material\n• Intended use\n• Product type\n• Capacity / size'
      });
    }

    // 4. Find matching standards from standards.json
    const matchingStandards = findMatchingStandards(matchedProduct, productDescription);

    // 5. Calculate relevance score
    const relevance = calculateRelevance(matchedProduct, productDescription, attributes);

    // 6. Identify matching factors
    const matchingFactors = identifyMatchingFactors(matchedProduct, productDescription, attributes);

    // 7. Get full context for source information
    const retrievalResult = retrieveContext(productDescription);
    const sources = retrievalResult.sources || [];

    // 8. Optionally get Gemini explanation
    let aiExplanation = await optionalGeminiExplanation(productDescription, matchedProduct, matchingFactors);
    let explanationProvider = 'fallback';

    if (aiExplanation) {
      explanationProvider = 'gemini';
    }

    const explanation = aiExplanation
      ? aiExplanation.explanation
      : buildLocalExplanation(matchedProduct, matchingFactors, productDescription);

    // 9. Build primary standard result
    const primaryStandard = matchingStandards.length > 0 ? matchingStandards[0] : {
      standardNumber: matchedProduct.possible_standard,
      title: matchedProduct.description || matchedProduct.product_name,
      category: matchedProduct.category,
      mandatoryStatus: matchedProduct.mandatory_status,
      scheme: matchedProduct.scheme_or_service,
      scope: matchedProduct.description,
      sourceRef: matchedProduct.sources && matchedProduct.sources[0] ? {
        docTitle: matchedProduct.sources[0].document_or_page,
        sourceType: matchedProduct.sources[0].source_name,
        status: 'Source-backed prototype response'
      } : null
    };

    // 10. Build other related standards (if any)
    const otherStandards = matchingStandards.slice(1).map(std => ({
      standardNumber: std.standardNumber,
      title: std.title,
      category: std.category,
      relevance: Math.max(relevance - 15, 40)
    }));

    // 11. Build structured product identification
    const productIdentification = {};
    if (matchedProduct.product_name) productIdentification.productType = matchedProduct.product_name;
    if (matchedProduct.category) productIdentification.category = matchedProduct.category;
    if (attributes.material) productIdentification.material = attributes.material;
    if (attributes.intendedUse) productIdentification.intendedUse = attributes.intendedUse;
    if (attributes.capacity) productIdentification.capacity = attributes.capacity;

    return res.status(200).json({
      ok: true,
      found: true,
      input: productDescription,
      extractedAttributes: attributes,
      productIdentification,
      primaryStandard: {
        standardNumber: primaryStandard.standardNumber,
        title: primaryStandard.title,
        category: primaryStandard.category,
        mandatoryStatus: primaryStandard.mandatoryStatus || matchedProduct.mandatory_status,
        scheme: primaryStandard.scheme || matchedProduct.scheme_or_service,
        scope: primaryStandard.scope,
        relevance,
        explanation,
        explanationProvider,
        matchingFactors,
        sourceRef: primaryStandard.sourceRef || null
      },
      otherStandards,
      sources: sources.map(s => ({
        title: s.document || s.source_name,
        sourceType: s.source_name,
        reference: s.page_or_section,
        url: s.url,
        status: s.verification_status === 'needs_verification' ? 'Pending Source Verification' : 'Verified Official Source'
      })),
      complianceNavigation: {
        targetTab: 'certification',
        payload: {
          product: matchedProduct.product_name,
          standard: matchedProduct.possible_standard,
          category: matchedProduct.category
        }
      }
    });

  } catch (err) {
    console.error('API Error in /api/find-standard:', err);
    return res.status(500).json({
      ok: false,
      error: 'Unable to analyze the product right now. Please try again in a moment.'
    });
  }
}
