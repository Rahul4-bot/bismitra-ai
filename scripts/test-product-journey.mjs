/**
 * Product Journey engine checks (no browser, no Gemini).
 * Run: node scripts/test-product-journey.mjs
 */

import { verifyProductScan, UNAVAILABLE, VERIFICATION } from '../src/services/productJourneyEngine.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test('Valid product id → BIS match, partially verified, no invented manufacturer', () => {
  const r = verifyProductScan({ scanValue: 'prod_001_electric_iron' });
  assert(r.ok && r.journey, 'expected journey');
  assert(r.journey.dataSource === 'bis', 'expected BIS data source');
  assert(r.journey.verification.status === VERIFICATION.PARTIALLY_VERIFIED, r.journey.verification.status);
  assert(r.journey.manufacturer === UNAVAILABLE, 'must not invent manufacturer');
  assert(r.journey.productName.includes('Electric Iron'), r.journey.productName);
  assert(r.journey.applicableStandards[0].code.includes('IS 302'), 'standard from products.json');
});

test('Invalid / empty QR → graceful error', () => {
  const empty = verifyProductScan({ scanValue: '   ' });
  assert(empty.ok === false && empty.errorCode === 'empty', 'empty identifier');
});

test('Unknown product → NOT FOUND', () => {
  const r = verifyProductScan({ scanValue: 'ZZZ-NOT-A-REAL-PRODUCT-999' });
  assert(r.ok && r.journey.verification.status === VERIFICATION.NOT_FOUND, 'not found');
  assert(!/fake/i.test(r.journey.meaning.notVerified), 'must not call the product fake');
});

test('Partial BIS record → PARTIALLY VERIFIED and missing fields listed', () => {
  const r = verifyProductScan({ scanValue: 'IS 4151: 2015' });
  assert(r.journey.verification.status === VERIFICATION.PARTIALLY_VERIFIED, r.journey.verification.status);
  assert(r.journey.verification.missingFields.includes('licenceNumber'), 'licence missing');
});

test('Expired demo licence → EXPIRED and demo labelled', () => {
  const r = verifyProductScan({ scanValue: 'DEMO-EXPIRED-LED' });
  assert(r.journey.dataSource === 'demo', 'demo source');
  assert(r.journey.verification.status === VERIFICATION.EXPIRED, r.journey.verification.status);
  assert(r.journey.demoDisclaimer.length > 10, 'disclaimer required');
});

test('Demo cooker → full demo journey, not labelled as official BIS', () => {
  const r = verifyProductScan({ scanValue: 'DEMO-PC-48291' });
  assert(r.journey.dataSource === 'demo', 'demo');
  assert(r.journey.verification.status === VERIFICATION.VERIFIED, r.journey.verification.status);
  assert(r.journey.stages.some((s) => s.id === 'manufacturer'), 'demo manufacturer stage');
  assert(r.explanation.toLowerCase().includes('demo'), r.explanation);
});

test('Multiple demo matches → selection list, no random pick', () => {
  const r = verifyProductScan({ scanValue: 'DEMO-MULTI' });
  assert(r.multiple === true, 'multiple flag');
  assert(r.candidates.length >= 2, 'at least two candidates');
  assert(r.journey == null, 'no journey until selection');
  const picked = verifyProductScan({ scanValue: 'DEMO-MULTI', selectedRecordId: r.candidates[0].id });
  assert(picked.journey && picked.journey.productId === r.candidates[0].id, 'selected journey');
});

test('Missing fields stay unavailable', () => {
  const r = verifyProductScan({ scanValue: 'prod_004_led_bulb' });
  const cert = r.journey.stages.find((s) => s.id === 'certification');
  assert(cert.fields.licenceNumber === UNAVAILABLE, 'no fake licence');
  assert(cert.fields.expiryDate === UNAVAILABLE, 'no fake expiry');
});

test('Gemini-less explanation still produced from structured data', () => {
  const r = verifyProductScan({ scanValue: 'prod_002_packaged_water' });
  assert(typeof r.explanation === 'string' && r.explanation.includes('IS 14543'), r.explanation);
});

test('Scheme-level query can return multiple BIS products', () => {
  const r = verifyProductScan({ scanValue: 'ISI Mark' });
  assert(r.multiple === true || (r.candidates && r.candidates.length >= 1), 'expected matches');
});

let failed = 0;
for (const t of tests) {
  try {
    t.fn();
    console.log('PASS', t.name);
  } catch (err) {
    failed += 1;
    console.error('FAIL', t.name, '-', err.message);
  }
}

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}

console.log(`\n${tests.length} tests passed`);
