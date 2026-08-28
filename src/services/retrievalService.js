import categoriesData from '../data/knowledge/categories.json' with { type: 'json' };
import productsData from '../data/knowledge/products.json' with { type: 'json' };
import certDocs from '../data/knowledge/documents/certification.json' with { type: 'json' };
import hallmarkDocs from '../data/knowledge/documents/hallmarking.json' with { type: 'json' };
import crsDocs from '../data/knowledge/documents/crs.json' with { type: 'json' };
import consumerDocs from '../data/knowledge/documents/consumer.json' with { type: 'json' };
import testingDocs from '../data/knowledge/documents/testing.json' with { type: 'json' };

// Consolidate all document knowledge
const allDocuments = [
  ...certDocs,
  ...hallmarkDocs,
  ...crsDocs,
  ...consumerDocs,
  ...testingDocs
];

// Common stop words to prevent false positive matching on generic question words
const STOP_WORDS = new Set([
  'how', 'what', 'which', 'where', 'when', 'why', 'who', 'the', 'is', 'are', 'was', 'were',
  'to', 'for', 'in', 'of', 'and', 'or', 'a', 'an', 'do', 'does', 'did', 'can', 'could',
  'should', 'would', 'i', 'my', 'me', 'you', 'your', 'it', 'its', 'be', 'been', 'with',
  'on', 'at', 'by', 'from', 'this', 'that', 'these', 'those', 'please', 'tell', 'about',
  'get', 'find', 'make', 'use', 'apply', 'does'
]);

/**
 * Normalizes input text into lowercase searchable tokens, optionally stripping common stop words.
 */
function tokenize(text, filterStopWords = false) {
  if (!text) return [];
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1);

  return filterStopWords ? tokens.filter(t => !STOP_WORDS.has(t)) : tokens;
}

/**
 * 1. Intent & Category Detector
 * Analyzes the user's query and scores against category keywords and definitions.
 */
export function detectCategory(query) {
  const queryLower = query.toLowerCase();
  const contentTokens = tokenize(query, true);

  if (contentTokens.length === 0) {
    return { category: null, score: 0 };
  }

  let bestCategory = null;
  let highestScore = 0;

  for (const cat of categoriesData) {
    let score = 0;

    // Check multi-word phrase match
    for (const kw of cat.keywords) {
      if (queryLower.includes(kw.toLowerCase())) {
        score += 4;
      } else {
        const kwTokens = tokenize(kw, true);
        const matchCount = kwTokens.filter(t => contentTokens.includes(t)).length;
        if (matchCount > 0) {
          score += matchCount * 2;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestCategory = cat;
    }
  }

  // Minimum threshold to consider category genuinely detected
  return {
    category: highestScore >= 2 ? bestCategory : null,
    score: highestScore
  };
}

/**
 * 2. Structured Product Knowledge Search (Layer A)
 * Searches products.json for matching products based on names, standards, and supported questions.
 */
export function searchStructuredProducts(query) {
  const queryLower = query.toLowerCase();
  const contentTokens = tokenize(query, true);

  if (contentTokens.length === 0) {
    return null;
  }

  let matchedProducts = [];

  for (const prod of productsData) {
    let score = 0;

    // Direct product name substring match
    if (queryLower.includes(prod.product_name.toLowerCase())) {
      score += 12;
    } else {
      // Check individual product content tokens
      const nameTokens = tokenize(prod.product_name, true);
      for (const token of nameTokens) {
        if (contentTokens.includes(token)) {
          score += 5;
        }
      }
    }

    // Check standard match (e.g. "IS 302", "14543", "4151", "16102", "1786", "1417")
    const standardNorm = prod.possible_standard.toLowerCase().replace(/[^a-z0-9]/g, '');
    const queryCompact = queryLower.replace(/[^a-z0-9]/g, '');
    if (queryCompact.includes(standardNorm) || contentTokens.some(t => prod.possible_standard.toLowerCase().includes(t))) {
      score += 10;
    }

    // Check supported questions similarity with content tokens
    for (const sq of prod.supported_questions) {
      const sqLower = sq.toLowerCase();
      if (queryLower.includes(sqLower) || sqLower.includes(queryLower)) {
        score += 8;
      }
      const sqTokens = tokenize(sq, true);
      const overlap = sqTokens.filter(t => contentTokens.includes(t)).length;
      if (overlap > 0) {
        score += overlap * 2.5;
      }
    }

    if (score >= 4) {
      matchedProducts.push({ product: prod, score });
    }
  }

  // Sort by highest score
  matchedProducts.sort((a, b) => b.score - a.score);
  return matchedProducts.length > 0 ? matchedProducts[0].product : null;
}

/**
 * 3. Document Knowledge Search (Layer B)
 * Searches across document entries with TF/IDF-style scoring, keyword matches, and category weighting.
 */
export function searchDocumentKnowledge(query, detectedCategoryId = null) {
  const queryLower = query.toLowerCase();
  const contentTokens = tokenize(query, true);

  if (contentTokens.length === 0) {
    return [];
  }

  const scoredDocs = allDocuments.map(doc => {
    let score = 0;

    // Check exact title match or substring
    if (queryLower.includes(doc.title.toLowerCase()) || doc.title.toLowerCase().includes(queryLower)) {
      score += 8;
    }

    // Title content token matches
    const titleTokens = tokenize(doc.title, true);
    for (const token of titleTokens) {
      if (contentTokens.includes(token)) {
        score += 3;
      }
    }

    // Keywords matching with domain content tokens
    for (const kw of doc.keywords) {
      if (queryLower.includes(kw.toLowerCase())) {
        score += 5;
      } else {
        const kwTokens = tokenize(kw, true);
        const matchCount = kwTokens.filter(t => contentTokens.includes(t)).length;
        if (matchCount > 0) {
          score += matchCount * 2.5;
        }
      }
    }

    // Content domain token matches
    const docContentTokens = tokenize(doc.content, true);
    for (const qToken of contentTokens) {
      const occurrences = docContentTokens.filter(ct => ct === qToken).length;
      if (occurrences > 0) {
        score += Math.min(occurrences * 0.5, 2.5);
      }
    }

    // Boost if matches detected category
    if (detectedCategoryId && doc.category === detectedCategoryId && score > 0) {
      score += 2;
    }

    return { doc, score };
  });

  // Filter out low scores (requires at least 4.0 score from genuine domain keyword matches)
  const relevantDocs = scoredDocs
    .filter(item => item.score >= 4.0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.doc);

  return relevantDocs;
}

/**
 * 4. Master Retrieval Function
 * Coordinates Intent Detection -> Structured Product Search -> Document Knowledge Search
 * Returns packaged verified context and normalized source metadata.
 */
export function retrieveContext(query) {
  const { category, score: catScore } = detectCategory(query);
  const matchedProduct = searchStructuredProducts(query);
  const matchedDocs = searchDocumentKnowledge(query, category ? category.id : null);

  // Collect and deduplicate sources
  const sourcesMap = new Map();

  if (matchedProduct && matchedProduct.sources) {
    matchedProduct.sources.forEach(src => {
      const key = `${src.source_name}|${src.document_or_page}`;
      sourcesMap.set(key, {
        source_name: src.source_name,
        document: src.document_or_page,
        page_or_section: src.page_or_section,
        url: src.url,
        verification_status: src.verification_status || 'verified'
      });
    });
  }

  matchedDocs.forEach(doc => {
    const key = `${doc.source_name}|${doc.document_title}`;
    if (!sourcesMap.has(key)) {
      sourcesMap.set(key, {
        source_name: doc.source_name,
        document: doc.document_title,
        page_or_section: doc.section || (doc.page && doc.page !== 'N/A' ? `Page ${doc.page}` : 'Section Reference'),
        url: doc.url,
        verification_status: doc.verification_status || 'verified'
      });
    }
  });

  const sources = Array.from(sourcesMap.values());

  // Determine if there is sufficient verified context to answer
  const hasSufficientContext = matchedProduct !== null || matchedDocs.length > 0;

  // Build grounded text context for AI model
  let contextParts = [];

  if (matchedProduct) {
    contextParts.push(
      `### STRUCTURED PRODUCT INFORMATION:\n` +
      `- Product: ${matchedProduct.product_name}\n` +
      `- Category: ${matchedProduct.category}\n` +
      `- Indian Standard (IS Code): ${matchedProduct.possible_standard}\n` +
      `- Applicable Scheme: ${matchedProduct.scheme_or_service}\n` +
      `- Regulatory Status: ${matchedProduct.mandatory_status}\n` +
      `- Certification Guidance: ${matchedProduct.certification_guidance}\n` +
      `- Key Requirements & Notes: ${matchedProduct.important_notes.join('; ')}`
    );
  }

  if (matchedDocs.length > 0) {
    contextParts.push(`### VERIFIED BIS DOCUMENT EXCERPTS:`);
    matchedDocs.forEach((doc, idx) => {
      contextParts.push(
        `[Document ${idx + 1}: ${doc.title}]\n` +
        `Source: ${doc.source_name} (${doc.document_title} - ${doc.section || ''})\n` +
        `Content: ${doc.content}`
      );
    });
  }

  const formattedContext = contextParts.join('\n\n');

  return {
    query,
    detectedCategory: category ? category.name : 'General BIS Query',
    categoryId: category ? category.id : null,
    matchedProduct,
    matchedDocs,
    formattedContext,
    sources,
    hasSufficientContext
  };
}
