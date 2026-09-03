/**
 * Product Journey verification engine.
 * Grounds all BIS facts in the existing knowledge JSON files.
 * Demo records are isolated and never labelled as official BIS data.
 */

import productsData from '../data/knowledge/products.json' with { type: 'json' };
import standardsData from '../data/standards.json' with { type: 'json' };
import demoPack from '../data/demo/productJourneyDemo.json' with { type: 'json' };
import { UNAVAILABLE } from '../constants/productJourney.js';

export { UNAVAILABLE };

export const VERIFICATION = {
  VERIFIED: 'VERIFIED',
  PARTIALLY_VERIFIED: 'PARTIALLY_VERIFIED',
  NOT_FOUND: 'NOT_FOUND',
  EXPIRED: 'EXPIRED',
  UNKNOWN: 'UNKNOWN'
};

const MAX_SCAN_LENGTH = 512;
const CANDIDATE_SCORE_MIN = 40;
const CLEAR_WINNER_GAP = 25;

function compact(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export function sanitizeScanValue(raw) {
  if (raw == null) return '';
  let value = String(raw);
  value = value.replace(/[\u0000-\u001F\u007F]/g, '');
  value = value.replace(/<[^>]*>/g, '');
  value = value.trim();
  if (value.length > MAX_SCAN_LENGTH) {
    value = value.slice(0, MAX_SCAN_LENGTH);
  }
  return value;
}

function unwrapQrPayload(value) {
  if (!value.startsWith('{') && !value.startsWith('[')) return value;
  try {
    const obj = JSON.parse(value);
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const nested =
        obj.productId ||
        obj.product_id ||
        obj.licenceNumber ||
        obj.licenseNumber ||
        obj.batchNumber ||
        obj.serialNumber ||
        obj.id ||
        obj.qr ||
        obj.code;
      if (nested != null && String(nested).trim()) {
        return sanitizeScanValue(String(nested));
      }
    }
  } catch {
    return value;
  }
  return value;
}

export function parseIdentifier(raw) {
  const sanitized = sanitizeScanValue(raw);
  if (!sanitized) {
    return { type: 'UNKNOWN', value: '', error: 'empty' };
  }

  const value = unwrapQrPayload(sanitized);
  if (!value) {
    return { type: 'UNKNOWN', value: '', error: 'malformed' };
  }

  const compactValue = value.replace(/\s+/g, '').toUpperCase();

  if (/^DEMO[-:]/i.test(value) || /^BISMITRA-DEMO/i.test(value) || /^PC-48291$/i.test(value)) {
    return { type: 'QR', value, dataSourceHint: 'demo' };
  }

  if (/^PROD_/i.test(value)) {
    return { type: 'PRODUCT_ID', value };
  }

  if (/^(CM\/?L[-:]?)\d{6,14}$/i.test(compactValue) || /^CML[-:]?\d{6,14}$/i.test(compactValue)) {
    return { type: 'LICENCE_NUMBER', value };
  }

  if (/^R-?\d{6,14}$/i.test(compactValue) || /^DEMO-R-/i.test(value)) {
    return { type: 'LICENCE_NUMBER', value };
  }

  if (/^IS[\s-]?\d/i.test(value)) {
    return { type: 'UNKNOWN', value };
  }

  if (/^\d{8,14}$/.test(value)) {
    return { type: 'BARCODE', value };
  }

  if (/^[A-Z0-9]{8,40}$/i.test(value) && value.includes('-')) {
    return { type: 'BATCH_NUMBER', value };
  }

  if (value.length > 80) {
    return { type: 'QR', value };
  }

  return { type: 'UNKNOWN', value };
}

function mapProductSource(src) {
  return {
    source_name: src.source_name,
    document: src.document_or_page,
    page_or_section: src.page_or_section,
    url: src.url || '',
    verification_status: src.verification_status || 'verified',
    dataSource: 'bis'
  };
}

function findMatchingStandard(product) {
  const target = compact(product.possible_standard);
  if (!target) return null;
  return standardsData.find((s) => compact(s.standardNumber) === target) || null;
}

function scoreBisProduct(product, queryValue) {
  const qLower = queryValue.toLowerCase();
  const qCompact = compact(queryValue);
  const nameLower = product.product_name.toLowerCase();
  let score = 0;
  const matchedFields = [];

  if (product.id.toLowerCase() === qLower) {
    score += 100;
    matchedFields.push('productId');
  }

  const stdCompact = compact(product.possible_standard);
  if (stdCompact && qCompact.length >= 5 && (qCompact === stdCompact || stdCompact.includes(qCompact) || qCompact.includes(stdCompact))) {
    score += 85;
    matchedFields.push('standard');
  }

  if (qLower === nameLower) {
    score += 90;
    matchedFields.push('productName');
  } else if (qLower.length >= 5 && nameLower.includes(qLower)) {
    score += 70;
    matchedFields.push('productName');
  } else {
    const nameTokens = tokenize(product.product_name);
    const queryTokens = tokenize(queryValue);
    const overlap = nameTokens.filter((t) => queryTokens.includes(t));
    if (overlap.length >= 2) {
      score += 55;
      matchedFields.push('productNameTokens');
    } else if (overlap.length === 1 && overlap[0].length >= 5) {
      score += 45;
      matchedFields.push('productNameTokens');
    }
  }

  const schemeLower = (product.scheme_or_service || '').toLowerCase();
  if (qLower.length >= 8 && schemeLower.includes(qLower)) {
    score += 42;
    matchedFields.push('scheme');
  }

  return { score, matchedFields, product, dataSource: 'bis' };
}

function scoreDemoRecord(record, queryValue) {
  const qLower = queryValue.toLowerCase();
  const qCompact = compact(queryValue);
  let score = 0;
  const matchedFields = [];

  if (record.id.toLowerCase() === qLower) {
    score += 100;
    matchedFields.push('productId');
  }

  for (const ident of record.identifiers || []) {
    if (ident.toLowerCase() === qLower || compact(ident) === qCompact) {
      score += 100;
      matchedFields.push('identifier');
      break;
    }
  }

  if (record.certification?.licenceNumber && compact(record.certification.licenceNumber) === qCompact) {
    score += 95;
    matchedFields.push('licenceNumber');
  }

  if (record.productName && qLower.length >= 5 && record.productName.toLowerCase().includes(qLower)) {
    score += 50;
    matchedFields.push('productName');
  }

  return { score, matchedFields, record, dataSource: 'demo' };
}

function candidateSummaryFromBis(item) {
  return {
    id: item.product.id,
    dataSource: 'bis',
    productName: item.product.product_name,
    category: item.product.category,
    manufacturer: UNAVAILABLE,
    licenceNumber: UNAVAILABLE,
    standard: item.product.possible_standard,
    model: null,
    score: item.score,
    matchedFields: item.matchedFields
  };
}

function candidateSummaryFromDemo(item) {
  return {
    id: item.record.id,
    dataSource: 'demo',
    productName: item.record.productName,
    category: item.record.category,
    manufacturer: item.record.manufacturer || UNAVAILABLE,
    licenceNumber: item.record.certification?.licenceNumber || UNAVAILABLE,
    standard: item.record.applicableStandards?.[0]?.code || UNAVAILABLE,
    model: item.record.productName,
    score: item.score,
    matchedFields: item.matchedFields
  };
}

function collectCandidates(queryValue) {
  const bis = productsData
    .map((product) => scoreBisProduct(product, queryValue))
    .filter((item) => item.score >= CANDIDATE_SCORE_MIN)
    .map(candidateSummaryFromBis);

  const demo = (demoPack.records || [])
    .map((record) => scoreDemoRecord(record, queryValue))
    .filter((item) => item.score >= CANDIDATE_SCORE_MIN)
    .map(candidateSummaryFromDemo);

  const merged = [...demo, ...bis].sort((a, b) => b.score - a.score);
  return merged;
}

function selectCandidates(all) {
  if (all.length === 0) return [];
  const top = all[0];
  const close = all.filter((c) => top.score - c.score < CLEAR_WINNER_GAP);
  if (close.length > 1 && close[0].score < 100) {
    return close;
  }
  if (close.length > 1 && close.filter((c) => c.score === top.score).length > 1) {
    return close.filter((c) => c.score === top.score);
  }
  return [top];
}

function coverageFromStages(stages) {
  const canonical = ['product', 'manufacturer', 'standard', 'testing', 'certification', 'manufacturing', 'distribution'];
  const present = canonical.filter((id) => stages.some((s) => s.id === id && s.present));
  return { verifiedStages: present.length, totalStages: canonical.length, presentIds: present };
}

function buildBisJourney(product, parsed, matchedFields) {
  const standard = findMatchingStandard(product);
  const sources = (product.sources || []).map(mapProductSource);
  if (standard?.sourceRef) {
    sources.push({
      source_name: standard.sourceRef.sourceType || 'BIS knowledge base',
      document: standard.sourceRef.docTitle,
      page_or_section: standard.sourceRef.clause,
      url: '',
      verification_status: 'verified',
      dataSource: 'bis'
    });
  }

  const stages = [];

  stages.push({
    id: 'product',
    present: true,
    title: 'Product identified',
    summary: product.product_name,
    fields: {
      productName: product.product_name,
      productId: product.id,
      category: product.category,
      description: product.description || UNAVAILABLE
    },
    sourceLabel: 'Connected BIS product knowledge'
  });

  stages.push({
    id: 'standard',
    present: true,
    title: 'Applicable BIS standard',
    summary: product.possible_standard,
    fields: {
      standardNumber: product.possible_standard,
      title: standard?.title || UNAVAILABLE,
      scope: standard?.scope || product.description || UNAVAILABLE,
      explanation: 'This standard defines the requirements applicable to this product.'
    },
    sourceLabel: standard?.sourceRef?.docTitle || 'Connected BIS product knowledge'
  });

  if (standard?.keyTests?.length) {
    stages.push({
      id: 'testing',
      present: true,
      title: 'Testing requirements in the standard',
      summary: `${standard.keyTests.length} tests listed in the connected standard`,
      fields: {
        laboratory: UNAVAILABLE,
        testDate: UNAVAILABLE,
        result: UNAVAILABLE,
        listedTests: standard.keyTests,
        note: 'These are tests described in the connected BIS standard. They are not laboratory results for this scanned unit.'
      },
      sourceLabel: standard.sourceRef?.docTitle || 'Connected BIS standard record'
    });
  }

  stages.push({
    id: 'certification',
    present: true,
    title: 'Certification scheme',
    summary: product.scheme_or_service,
    fields: {
      scheme: product.scheme_or_service,
      mandatoryStatus: product.mandatory_status,
      guidance: product.certification_guidance || UNAVAILABLE,
      licenceNumber: UNAVAILABLE,
      licenceStatus: UNAVAILABLE,
      issueDate: UNAVAILABLE,
      expiryDate: UNAVAILABLE,
      note: 'Scheme-level information from the BIS knowledge base. No product-specific licence number was found for this identifier.'
    },
    sourceLabel: 'Connected BIS product knowledge'
  });

  const coverage = coverageFromStages(stages);
  const missingFields = [
    'manufacturer',
    'licenceNumber',
    'batchNumber',
    'serialNumber',
    'actualTestResults',
    'distribution'
  ];

  return {
    dataSource: 'bis',
    productId: product.id,
    productName: product.product_name,
    category: product.category,
    manufacturer: UNAVAILABLE,
    identifierUsed: parsed.value,
    identifierType: parsed.type,
    applicableStandards: [
      {
        code: product.possible_standard,
        name: standard?.title || product.possible_standard
      }
    ],
    bisStatus: VERIFICATION.UNKNOWN,
    verification: {
      status: VERIFICATION.PARTIALLY_VERIFIED,
      matchedFields: Array.from(new Set(matchedFields)),
      missingFields,
      confidence: matchedFields.includes('productId') || matchedFields.includes('standard') ? 'medium' : 'low'
    },
    stages,
    coverage,
    sources,
    meaning: {
      verified: 'Based on the available BIS information, BISMITRA matched this identifier to a product record and applicable standard/scheme information in the connected knowledge base.',
      notVerified: 'Manufacturer identity, a product-specific licence/CM/L or R-number, batch/serial history, laboratory results for this unit, and distribution history were not available in the connected BIS data.'
    }
  };
}

function presentValue(value) {
  if (value == null || value === '') return null;
  return value;
}

function buildDemoJourney(record, parsed, matchedFields) {
  const certStatus = (record.certification?.status || 'UNKNOWN').toUpperCase();
  const stages = [];

  stages.push({
    id: 'product',
    present: true,
    title: 'Product identified',
    summary: record.productName,
    fields: {
      productName: record.productName,
      productId: record.id,
      category: record.category,
      serialNumber: record.serialNumber || UNAVAILABLE
    },
    sourceLabel: 'Isolated demo dataset'
  });

  if (record.manufacturer) {
    stages.push({
      id: 'manufacturer',
      present: true,
      title: 'Manufacturer',
      summary: record.manufacturer,
      fields: {
        manufacturer: record.manufacturer,
        manufacturerId: record.manufacturerId || UNAVAILABLE
      },
      sourceLabel: 'Isolated demo dataset'
    });
  }

  const std = record.applicableStandards?.[0];
  if (std) {
    stages.push({
      id: 'standard',
      present: true,
      title: 'Applicable BIS standard',
      summary: std.code,
      fields: {
        standardNumber: std.code,
        title: std.name,
        explanation: 'This standard label is part of the isolated demo record, not an official licence lookup.'
      },
      sourceLabel: 'Isolated demo dataset'
    });
  }

  if (record.testing) {
    stages.push({
      id: 'testing',
      present: true,
      title: 'Testing',
      summary: record.testing.result || 'Demo testing record',
      fields: {
        laboratory: record.testing.laboratory,
        testDate: record.testing.testDate,
        result: record.testing.result,
        source: record.testing.source
      },
      sourceLabel: 'Isolated demo dataset'
    });
  }

  if (record.certification) {
    stages.push({
      id: 'certification',
      present: true,
      title: 'Certification / licence',
      summary: `${record.certification.licenceNumber} · ${certStatus}`,
      fields: {
        licenceNumber: record.certification.licenceNumber,
        status: certStatus,
        issueDate: record.certification.issueDate,
        expiryDate: record.certification.expiryDate,
        source: record.certification.source
      },
      sourceLabel: 'Isolated demo dataset'
    });
  }

  if (record.manufacturing) {
    stages.push({
      id: 'manufacturing',
      present: true,
      title: 'Batch / manufacturing',
      summary: record.manufacturing.batchNumber,
      fields: {
        facility: record.manufacturing.facility,
        batchNumber: record.manufacturing.batchNumber,
        manufacturingDate: record.manufacturing.manufacturingDate
      },
      sourceLabel: 'Isolated demo dataset'
    });
  }

  if (record.distribution) {
    stages.push({
      id: 'distribution',
      present: true,
      title: 'Market / distribution',
      summary: record.distribution.location,
      fields: {
        distributor: record.distribution.distributor,
        location: record.distribution.location,
        date: record.distribution.date
      },
      sourceLabel: 'Isolated demo dataset'
    });
  }

  let verificationStatus = VERIFICATION.VERIFIED;
  let bisStatus = certStatus;
  if (certStatus === 'EXPIRED') {
    verificationStatus = VERIFICATION.EXPIRED;
  } else if (!record.certification || !std) {
    verificationStatus = VERIFICATION.PARTIALLY_VERIFIED;
    bisStatus = VERIFICATION.UNKNOWN;
  }

  const coverage = coverageFromStages(stages);
  const missingFields = [];
  if (!presentValue(record.serialNumber)) missingFields.push('serialNumber');
  if (!record.distribution) missingFields.push('distribution');

  return {
    dataSource: 'demo',
    demoDisclaimer: demoPack.disclaimer,
    productId: record.id,
    productName: record.productName,
    category: record.category,
    manufacturer: record.manufacturer || UNAVAILABLE,
    identifierUsed: parsed.value,
    identifierType: parsed.type,
    applicableStandards: record.applicableStandards || [],
    bisStatus,
    verification: {
      status: verificationStatus,
      matchedFields: Array.from(new Set(matchedFields)),
      missingFields,
      confidence: 'high'
    },
    stages,
    coverage,
    sources: [
      {
        source_name: 'BISMITRA demo dataset',
        document: 'src/data/demo/productJourneyDemo.json',
        page_or_section: record.id,
        url: '',
        verification_status: 'demo',
        dataSource: 'demo'
      }
    ],
    meaning: {
      verified:
        certStatus === 'EXPIRED'
          ? 'Certification/licence appears expired according to the available demo record.'
          : 'This isolated demo record includes product, manufacturer, standard, testing, and certification fields so the journey UI can be demonstrated.',
      notVerified: missingFields.length
        ? `The demo record does not include: ${missingFields.join(', ')}.`
        : 'This demo record includes the stages shown below. It is not an official BIS licence record.'
    }
  };
}

export function buildFallbackExplanation(journey) {
  if (!journey) {
    return 'Product could not be verified using the available BIS data.';
  }

  if (journey.dataSource === 'demo') {
    const status = journey.verification?.status;
    const std = journey.applicableStandards?.[0]?.code || 'a listed demo standard';
    if (status === VERIFICATION.EXPIRED) {
      return `Demo data: this example product is associated with ${std}. The demo record shows an expired certification/licence. This is not an official BIS lookup.`;
    }
    return `Demo data: this example product is associated with ${std}. The demo record shows certification status ${journey.bisStatus}. This is not an official BIS licence record.`;
  }

  const name = journey.productName;
  const std = journey.applicableStandards?.[0]?.code;
  const scheme = journey.stages?.find((s) => s.id === 'certification')?.fields?.scheme;
  return `This product (${name}) is associated with ${std}. The available BIS record shows scheme-level information (${scheme}). A product-specific licence number and manufacturer identity were not available in the connected BIS data.`;
}

export function verifyProductScan({ scanValue, selectedRecordId = null } = {}) {
  const parsed = parseIdentifier(scanValue);

  if (parsed.error === 'empty') {
    return {
      ok: false,
      errorCode: 'empty',
      message: 'Please scan a QR code or enter a product identifier.',
      parsed,
      candidates: [],
      journey: null
    };
  }

  if (parsed.error === 'malformed') {
    return {
      ok: false,
      errorCode: 'malformed',
      message: 'The scanned value could not be read as a product identifier. Try entering the product ID, standard number, or licence number manually.',
      parsed,
      candidates: [],
      journey: null
    };
  }

  let candidates = collectCandidates(parsed.value);

  if (selectedRecordId) {
    const chosen = candidates.find((c) => c.id === selectedRecordId);
    if (!chosen) {
      return {
        ok: false,
        errorCode: 'invalid_selection',
        message: 'The selected record is no longer available. Please scan or search again.',
        parsed,
        candidates,
        journey: null
      };
    }
    candidates = [chosen];
  } else {
    candidates = selectCandidates(candidates);
  }

  if (candidates.length === 0) {
    return {
      ok: true,
      errorCode: null,
      message: 'Product could not be verified using the available BIS data.',
      parsed,
      candidates: [],
      journey: {
        dataSource: 'bis',
        productId: null,
        productName: null,
        verification: {
          status: VERIFICATION.NOT_FOUND,
          matchedFields: [],
          missingFields: ['product', 'standard', 'certification'],
          confidence: 'none'
        },
        bisStatus: VERIFICATION.NOT_FOUND,
        stages: [],
        coverage: { verifiedStages: 0, totalStages: 7, presentIds: [] },
        sources: [],
        meaning: {
          verified: 'No matching record was found.',
          notVerified: 'The identifier did not match a product, standard, or demo record in the connected data.'
        }
      },
      explanation: 'Product could not be verified using the available BIS data.'
    };
  }

  if (candidates.length > 1) {
    return {
      ok: true,
      errorCode: null,
      multiple: true,
      message: 'Multiple records found. Select the correct product to build its journey.',
      parsed,
      candidates,
      journey: null
    };
  }

  const selected = candidates[0];
  let journey;

  if (selected.dataSource === 'demo') {
    const record = demoPack.records.find((r) => r.id === selected.id);
    journey = buildDemoJourney(record, parsed, selected.matchedFields);
  } else {
    const product = productsData.find((p) => p.id === selected.id);
    journey = buildBisJourney(product, parsed, selected.matchedFields);
  }

  return {
    ok: true,
    errorCode: null,
    multiple: false,
    message: 'Product journey ready.',
    parsed,
    candidates,
    journey,
    explanation: buildFallbackExplanation(journey)
  };
}
