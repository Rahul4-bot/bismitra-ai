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

// Product-neutral words that describe BIS topics or are functional helpers,
// NOT any specific product. These must NOT by themselves cause a specific
// product to be selected, and must not be mistaken for a product reference.
const GENERIC_WORDS = new Set([
  ...STOP_WORDS,
  // BIS / domain abbreviations
  'bis', 'isi', 'cml', 'crl', 'qco', 'nabl', 'huid', 'lrs', 'bismitra', 'manakonline',
  // product / topic-neutral English terms
  'product', 'products', 'standard', 'standards', 'certification', 'certified',
  'testing', 'test', 'tests', 'tested', 'required', 'requirement', 'requirements',
  'mark', 'marks', 'process', 'scheme', 'apply', 'applicable', 'mandatory', 'quality',
  'compliance', 'approval', 'approve', 'license', 'licence', 'registration',
  'register', 'verify', 'verification', 'verify karein', 'valid', 'validity', 'number',
  'info', 'information', 'faq', 'guide', 'guidance', 'category', 'categories',
  'want', 'need', 'looking', 'know', 'regarding', 'about', 'hello', 'help', 'more',
  // Hinglish / Hindi functional words (Roman script)
  'wale', 'wala', 'walon', 'ka', 'ki', 'ke', 'ko', 'se', 'me', 'par', 'hai', 'hain',
  'hota', 'hote', 'hoti', 'hona', 'hone', 'hoga', 'hogi', 'honge', 'tha', 'the',
  'kya', 'kaise', 'kais', 'karna', 'karo', 'karu', 'kro', 'kar', 'karke', 'karne',
  'karenge', 'karti', 'karta', 'chahiye', 'mujhe', 'mujh', 'mera', 'meri', 'mere',
  'apna', 'apne', 'apni', 'aapka', 'aapp', 'aap', 'tum', 'yeh', 'yah', 'aur', 'bhi',
  'nahi', 'raha', 'rahi', 'rahe', 'sakta', 'sakti', 'sakte', 'sakti', 'kaunsa',
  'kaun', 'kaunse', 'kaisi', 'kis', 'kisi', 'kise', 'kyun', 'kyu', 'kahan', 'kab',
  'batao', 'btao', 'bataiye', 'batiye', 'dijiye', 'kijiye', 'toh', 'to', 'dhanwad',
  'ji', 'hmm', 'sawal', 'sawaal', 'puchna', 'pucho', 'banao', 'rakho', 'de', 'do',
  'find', 'lookup', 'search', 'applyfor', 'bata', 'btana', 'kitna', 'kitne'
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

  // Product-specific tokens: remove English stop words AND generic BIS/product-neutral
  // words so that words like "product", "standard", "certification", "mark" can never
  // by themselves select a specific product.
  const productTokens = tokenize(query, true).filter(t => !GENERIC_WORDS.has(t));

  if (productTokens.length === 0) {
    return null;
  }

  const queryCompact = queryLower.replace(/[^a-z0-9]/g, '');

  let best = null;
  let bestScore = 0;

  for (const prod of productsData) {
    const nameLower = prod.product_name.toLowerCase();
    let score = 0;
    let strong = false;

    // STRONG 1: Standard number match (e.g. IS 4151, 1786, 1417, IS 302-2-3).
    // Compare on the standard's numeric core without the year suffix so that
    // "IS 4151" matches "IS 4151: 2015" and "4151" / "1786" also match.
    const standardNorm = prod.possible_standard.toLowerCase().replace(/[^a-z0-9]/g, '');
    const standardCore = standardNorm.replace(/20\d{2}$/, '');
    const queryDigits = queryCompact.replace(/[^0-9]/g, '');
    const standardDigits = standardCore.replace(/[^0-9]/g, '');
    if (standardNorm && (
      queryCompact.includes(standardNorm) ||
      (standardCore.length >= 5 && queryCompact.includes(standardCore)) ||
      (standardDigits.length >= 4 && queryDigits.includes(standardDigits))
    )) {
      score += 80;
      strong = true;
    }

    // STRONG 2: Direct product-name substring match ("electric iron" in query)
    if (queryLower.includes(nameLower)) {
      score += 100;
      strong = true;
    }

    // STRONG 3: Meaningful product-name token overlap (prefix-aware for singular/plural)
    const nameTokens = tokenize(prod.product_name, true);
    const overlap = countPrefixMatch(productTokens, nameTokens);
    if (overlap >= 2) {
      score += 45 + overlap * 6;
      strong = true;
    } else if (overlap === 1) {
      score += 25;
      strong = true;
    }

    // WEAK (tiebreaker only): meaningful supported-question tokens.
    // Never creates a match by itself; only makes an already-strong match win.
    if (strong) {
      let qOverlap = 0;
      for (const sq of prod.supported_questions) {
        const sqTokens = tokenize(sq, true).filter(t => !GENERIC_WORDS.has(t));
        qOverlap += countPrefixMatch(productTokens, sqTokens);
      }
      score += Math.min(qOverlap * 2, 12);
    }

    if (strong && score > bestScore) {
      bestScore = score;
      best = prod;
    }
  }

  return best;
}

/**
 * Counts how many tokens from `queryTokens` match any token in `pool`.
 * Uses prefix matching so singular/plural forms align (helmet → helmets).
 * Only counts meaningful tokens (length >= 4) to avoid ambiguity.
 */
function countPrefixMatch(queryTokens, pool) {
  if (!queryTokens.length || !pool.length) return 0;
  let count = 0;
  for (const qt of queryTokens) {
    if (qt.length < 4) continue;
    for (const pt of pool) {
      if (qt === pt || (pt.length >= 4 && (pt.startsWith(qt) || qt.startsWith(pt)))) {
        count++;
        break;
      }
    }
  }
  return count;
}

/**
 * Returns the product-specific tokens in a query: English stop words and generic
 * BIS/product-neutral words are removed so only concrete product references remain.
 */
function queryProductTokens(query) {
  return tokenize(query, true).filter(t => !GENERIC_WORDS.has(t));
}

/**
 * Unknown-product guard.
 * If a query references a specific product term (e.g. "pressure cooker",
 * "refrigerator") that matches no product in the KB AND does not appear in any
 * retrieved document, the retrieved document hits are unrelated generic matches.
 * In that case we treat it as insufficient context rather than answering with
 * unrelated documents.
 */
function isUnmatchedProductReference(matchedProduct, matchedDocs, query) {
  const productTokens = queryProductTokens(query).filter(t => t.length >= 4);
  if (productTokens.length === 0) return false;
  if (matchedProduct) return false;
  if (!matchedDocs || matchedDocs.length === 0) return false;

  // If any retrieved doc actually references the product term, keep the docs.
  for (const tok of productTokens) {
    for (const doc of matchedDocs) {
      const haystack = `${(doc.title || '')} ${(doc.keywords || []).join(' ')} ${(doc.content || '')}`.toLowerCase();
      if (haystack.includes(tok)) return false;
    }
  }

  return true;
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

  // If the query references a concrete product that is not in the KB (and no
  // document actually mentions it), drop the unrelated document matches so the
  // assistant reports "not available" instead of answering from unrelated docs.
  if (isUnmatchedProductReference(matchedProduct, matchedDocs, query)) {
    return {
      query,
      detectedCategory: category ? category.name : 'General BIS Query',
      categoryId: category ? category.id : null,
      matchedProduct: null,
      matchedDocs: [],
      formattedContext: '',
      sources: [],
      hasSufficientContext: false
    };
  }

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
