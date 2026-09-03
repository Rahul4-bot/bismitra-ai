import React, { useState } from 'react';
import {
  FlaskConical,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Info,
  ExternalLink,
  BookOpen,
  FileText,
  ShieldCheck
} from 'lucide-react';
import Badge from '../common/Badge';
import SourceCard from '../common/SourceCard';

// Verified BIS knowledge data reused directly (imported by path)
import testingDocs from '../../data/knowledge/documents/testing.json';
import productsData from '../../data/knowledge/products.json';
import standardsData from '../../data/standards.json';
import sourcesData from '../../data/sources.json';

// Look up the verified testing documents (safe lookups)
const labNetworkDoc = testingDocs.find(d => d.id === 'doc_test_001_lab_network');
const sampleSubmissionDoc = testingDocs.find(d => d.id === 'doc_test_002_sample_submission');
const nablDoc = testingDocs.find(d => d.id === 'doc_test_003_nabl_accreditation');
const labSource = sourcesData.find(s => s.id === 'src-lab-rules');

// The knowledge base references an older LIMS URL that is now stale (404).
// Use this verified live BIS LIMS portal as the working destination for the
// search CTA and testing source links, without modifying the knowledge JSON.
const LIVE_LIMS_URL = 'https://lims.bis.gov.in/';

function resolveDocUrl(doc) {
  // Prefer the verified live LIMS portal; fall back to the source's URL if present.
  return LIVE_LIMS_URL || (doc && doc.url) || '';
}

// Build product → standard lookup for each product in products.json
const productStandardPairs = productsData.map(product => {
  const stdNumber = product.possible_standard;
  const std = standardsData.find(s => s.standardNumber === stdNumber);
  return { product, standard: std || null };
});

// BIS Central & Regional lab facilities — extracted from doc_test_001 only
const BIS_LABS = [
  'BIS Central Laboratory — Sahibabad',
  'SRO — Chennai',
  'ERO — Kolkata',
  'WRO — Mumbai',
  'NRO — Mohali',
  'BIS facility — Bangalore',
  'BIS facility — Patna'
];

// Pre-testing prerequisites — extracted from doc_test_002 only
const PREREQS = [
  {
    title: 'Test Request Form (TRF)',
    desc: 'Detailing product name, model/type, applicant information, and requested testing parameters.'
  },
  {
    title: 'Technical Documentation',
    desc: 'Circuit schematics, rating plate artwork, component list, and material safety data sheets where applicable.'
  },
  {
    title: 'Standard Sample Quantity',
    desc: 'Prescribed sample units as per the specific standard sampling plan.'
  },
  {
    title: 'Testing Fee Payment Receipt',
    desc: 'Payment receipt for prescribed laboratory test charges according to the official BIS test fee schedule.'
  }
];

// Why testing matters — grounded in doc_cert_004 and doc_test_001/002
const TESTING_LIFECYCLE = [
  {
    title: 'Prepare Product / Sample',
    desc: 'Set up the in-house laboratory, assemble technical documentation, and prepare the standard sample quantity as required.'
  },
  {
    title: 'Conduct Required Tests',
    desc: 'Perform mandatory routine tests in-house, and submit sealed samples to a BIS Central or recognized NABL laboratory for independent verification testing.'
  },
  {
    title: 'Review Test Results',
    desc: 'Review the laboratory test report and compare findings against the applicable Indian Standard requirements.'
  },
  {
    title: 'Continue BIS Compliance',
    desc: 'Proceed with the applicable certification process (Scheme-I ISI Mark or Scheme-II CRS) based on the testing outcome.'
  }
];

function ProductCard({ pair, isExpanded, onToggle }) {
  const { product, standard } = pair;
  const keyTests = standard?.keyTests || [];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-emerald-300">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer"
        aria-expanded={isExpanded}
      >
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">{product.product_name}</h4>
            {keyTests.length > 0 && (
              <Badge variant="voluntary" size="sm">{keyTests.length} key tests</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
            <span className="font-mono font-semibold text-slate-700">{product.possible_standard}</span>
            <span>•</span>
            <span>{product.scheme_or_service}</span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4 border-t border-slate-100 pt-4 animate-in fade-in duration-150">
          {/* Standard & scope */}
          {standard && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Standard Scope</p>
              <p className="text-xs text-slate-600 leading-relaxed">{standard.scope}</p>
              {standard.mandatoryStatus && (
                <div className="pt-1">
                  <Badge variant="mandatory" size="sm">{standard.mandatoryStatus}</Badge>
                </div>
              )}
            </div>
          )}

          {/* Key Tests */}
          {keyTests.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Key Testing Methods</p>
              <ul className="space-y-1">
                {keyTests.map(t => (
                  <li key={t} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* In-house lab guidance */}
          {product.certification_guidance && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">In-house Testing Guidance</p>
              <p className="text-xs text-slate-600 leading-relaxed">{product.certification_guidance}</p>
            </div>
          )}

          {/* Important notes */}
          {product.important_notes && product.important_notes.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Important Notes</p>
              <ul className="space-y-1">
                {product.important_notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <Info className="w-3.5 h-3.5 text-yellow-700 mt-0.5 shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TestingLabsPage({ onNavigate, payload = null }) {
  const [expandedId, setExpandedId] = useState(null);

  const filterCategory = payload?.category || null;

  // Filter products by category if payload provides one
  const filteredPairs = filterCategory
    ? productStandardPairs.filter(p =>
        p.product.category?.toLowerCase().trim() === filterCategory.toLowerCase().trim()
      )
    : productStandardPairs;

  const hasResults = filteredPairs.length > 0;

  // Collect all source cards for the sources section
  const allSources = [
    ...(labNetworkDoc ? [{
      title: labNetworkDoc.title,
      sourceType: labNetworkDoc.source_name,
      reference: labNetworkDoc.section,
      url: resolveDocUrl(labNetworkDoc)
    }] : []),
    ...(sampleSubmissionDoc ? [{
      title: sampleSubmissionDoc.title,
      sourceType: sampleSubmissionDoc.source_name,
      reference: sampleSubmissionDoc.section,
      url: resolveDocUrl(sampleSubmissionDoc)
    }] : []),
    ...(nablDoc ? [{
      title: nablDoc.title,
      sourceType: nablDoc.source_name,
      reference: nablDoc.section,
      url: resolveDocUrl(nablDoc)
    }] : []),
    ...(labSource ? [{
      title: labSource.title,
      sourceType: labSource.sourceType,
      reference: labSource.reference,
      url: ''
    }] : [])
  ].filter(Boolean);

  // Graceful fallback if core data is missing
  if (!testingDocs || testingDocs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-gov-md text-center space-y-4">
        <p className="text-sm text-slate-600">Testing information is currently unavailable.</p>
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gov-navy hover:bg-blue-900 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          ← Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-gov-md space-y-8 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">TESTING & LABS</Badge>
            <span className="text-xs text-slate-400">BIS Knowledge Reference</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            Testing & Labs Guide
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Understand product testing, laboratory requirements and BIS testing pathways.
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-gov-navy bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          ← Return to Home & Chat
        </button>
      </div>

      {/* SECTION 1 — HERO */}
      <section className="bg-gradient-to-br from-emerald-50/70 to-green-50 border border-emerald-200/60 rounded-2xl p-6 sm:p-8 shadow-gov-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            BIS Product Testing
          </h3>
          <Badge variant="primary" size="sm">BIS Reference Guide</Badge>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
          Product testing helps establish conformity with the applicable BIS standard. BISMITRA can explain
          the testing requirements available in its knowledge base, including standard-specific test methods,
          pre-testing prerequisites, and the BIS laboratory network.
        </p>
        <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
          <Info className="w-3.5 h-3.5" />
          Based on BIS reference information in BISMITRA's knowledge base.
        </p>
      </section>

      {/* SECTION 2 — WHY TESTING MATTERS */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Why Product Testing Matters</h3>
          <p className="text-xs text-slate-500">A structured testing lifecycle supports BIS product certification and ongoing compliance.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-0">
          {TESTING_LIFECYCLE.map((step, i) => (
            <div key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gov-navy text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                  {i + 1}
                </div>
                {i < TESTING_LIFECYCLE.length - 1 && <div className="w-0.5 flex-1 bg-slate-300 my-1" />}
              </div>
              <div className={i < TESTING_LIFECYCLE.length - 1 ? 'pb-5' : ''}>
                <p className="text-sm font-bold text-slate-900">{step.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — PRODUCT TESTING EXPLORER */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Product → Standard → Test Methods</h3>
          <p className="text-xs text-slate-500">Explore the testing requirements for products in the BISMITRA knowledge base.</p>
        </div>

        {/* Category banner if filtering */}
        {filterCategory && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-700 shrink-0" />
            <p className="text-xs text-blue-800 font-semibold">
              Showing testing guidance for: {filterCategory}
            </p>
          </div>
        )}

        {/* No results message */}
        {filterCategory && !hasResults && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-2">
            <p className="text-sm text-slate-600">
              No product-specific testing record is available for this category in the current BISMITRA knowledge base.
            </p>
            <button
              onClick={() => setExpandedId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gov-navy hover:text-blue-700 transition-colors cursor-pointer"
            >
              View all available testing guidance
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Product cards grid */}
        <div className="space-y-3">
          {filteredPairs.map(pair => (
            <ProductCard
              key={pair.product.id}
              pair={pair}
              isExpanded={expandedId === pair.product.id}
              onToggle={() => setExpandedId(expandedId === pair.product.id ? null : pair.product.id)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 4 — PRE-TESTING REQUIREMENTS */}
      {sampleSubmissionDoc && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-yellow-700" />
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Before Sending a Sample</h3>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              Before submitting a product sample for conformity testing, the applicant/manufacturer should prepare the following.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREREQS.map((prereq, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center text-[11px] font-bold font-mono shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm font-bold text-slate-900">{prereq.title}</p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{prereq.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5 — BIS LAB NETWORK */}
      {labNetworkDoc && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">BIS Laboratory Network</h3>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              BIS operates a nationwide testing ecosystem consisting of in-house Central & Regional Test Houses and recognized laboratories under the Laboratory Recognition Scheme (LRS 2020).
            </p>
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">BIS Central & Regional Facilities</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BIS_LABS.map(lab => (
                  <div key={lab} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-xs text-slate-700 font-medium">{lab}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6 — LIMS / LAB SEARCH */}
      {labNetworkDoc && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-gov-blue" />
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Search BIS Testing Facilities</h3>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Users and manufacturers can search accredited laboratories through the BIS Laboratory Information Management System (LIMS) by filtering by state, product category, or IS standard code.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={resolveDocUrl(labNetworkDoc)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gov-navy hover:bg-blue-900 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-gov-sm"
              >
                Search BIS Testing Facilities
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-[11px] text-slate-400 italic">External BIS LIMS reference</span>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7 — NABL + LRS */}
      {nablDoc && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">NABL Accreditation & LRS</h3>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-800">{nablDoc.title}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{nablDoc.content}</p>
            {nablDoc.document_title && (
              <p className="text-[11px] text-slate-400">
                Reference: {nablDoc.document_title} — {nablDoc.section}
              </p>
            )}
          </div>
        </section>
      )}

      {/* SECTION 8 — CONNECTION TO CERTIFICATION */}
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Next Steps</h3>
          <p className="text-xs text-slate-500">Continue exploring BIS compliance tools available in BISMITRA.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('certification')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gov-navy hover:bg-blue-900 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-gov-sm"
          >
            Continue to Certification Guide
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('find-standard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-gov-navy bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            Find My Standard
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* SECTION 9 — SOURCES & TRUST */}
      {allSources.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Information Sources</h3>
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Based on BIS reference information available in BISMITRA's knowledge base.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allSources.map((src, i) => (
              <SourceCard
                key={i}
                title={src.title}
                sourceType={src.sourceType}
                reference={src.reference}
                status="Verified BIS reference"
                url={src.url || ''}
                linkText="View Source"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
