import React, { useRef, useEffect } from 'react';
import {
  Gem,
  ShieldCheck,
  BookOpen,
  Search,
  Info,
  Sparkles,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Badge from '../common/Badge';
import SourceCard from '../common/SourceCard';

// Verified BIS knowledge data reused directly (imported by path)
import hallmarkDocs from '../../data/knowledge/documents/hallmarking.json';
import productsData from '../../data/knowledge/products.json';
import standardsData from '../../data/standards.json';
import sourcesData from '../../data/sources.json';

// Look up the verified hallmarking documents (safe lookups)
const overviewDoc = hallmarkDocs.find(d => d.id === 'doc_hallmark_001_overview');
const threeMarksDoc = hallmarkDocs.find(d => d.id === 'doc_hallmark_002_three_marks');
const huidDoc = hallmarkDocs.find(d => d.id === 'doc_hallmark_003_huid_verification');
const redressalDoc = hallmarkDocs.find(d => d.id === 'doc_hallmark_004_consumer_redressal');

// Look up the gold jewellery product record
const goldProduct = productsData.find(p => p.id === 'prod_006_gold_jewellery');
const is1417 = standardsData.find(s => s.id === 'is-1417');
const hallmarkSource = sourcesData.find(s => s.id === 'src-hallmark-is1417');

// The 3 mandatory marks - grounded in the existing knowledge base wording
// The 3 mandatory marks - wording grounded directly in doc_hallmark_002
const marksIntro = threeMarksDoc?.content || 'Every piece of hallmarked gold jewellery sold in India must bear 3 distinct laser-engraved marks.';
const MARKS = [
  {
    num: 1,
    title: 'BIS Logo',
    icon: ShieldCheck,
    summary: 'The BIS Standard Logo: a triangular mark signifying BIS certification of the article.'
  },
  {
    num: 2,
    title: 'Purity / Fineness',
    icon: Gem,
    summary: 'Purity in karat and fineness: approved grades such as 24K999 (99.9%), 22K916 (91.6%), 18K750 (75.0%) and 14K585 (58.5%).'
  },
  {
    num: 3,
    title: 'HUID',
    icon: Sparkles,
    summary: 'Hallmark Unique Identification (HUID): a unique 6-digit alphanumeric code laser-inscribed on each piece at a BIS-recognized Assaying and Hallmarking Centre (AHC).'
  }
];

// Consumer HUID verification flow - grounded in doc_hallmark_003
const HUID_STEPS = [
  {
    title: 'Locate the HUID on the jewellery',
    desc: 'The HUID is laser-engraved on the hallmarked piece alongside the BIS logo and purity mark.'
  },
  {
    title: 'Open the BIS Care app',
    desc: 'Use the official BIS Care mobile application for consumer verification.'
  },
  {
    title: 'Use the HUID verification facility',
    desc: 'Access the Verify HUID feature within the BIS Care app.'
  },
  {
    title: 'Check the returned BIS information',
    desc: 'Review the jeweller registration, AHC details, date, article type and purity grade shown.'
  }
];

// The hallmarking process flow - aligned with existing knowledge (Fire Assay / XRF / Laser only)
const PROCESS_STEPS = [
  { label: 'Jewellery', desc: 'Gold jewellery or artefacts presented for hallmarking.' },
  { label: 'BIS Hallmarking Framework', desc: 'Mandatory in notified districts under the Hallmarking Order.' },
  { label: 'Testing / Assaying', desc: 'Fire Assay (cupellation), XRF screening, and laser inscription verification.' },
  { label: 'Hallmark', desc: 'The 3 mandatory marks: BIS logo, purity/fineness, and HUID.' },
  { label: 'HUID / Consumer Verification', desc: 'Consumers verify via the BIS Care app Verify HUID facility.' }
];

function ContextRow({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function HallmarkingPage({ onNavigate, payload = null }) {
  const huidRef = useRef(null);
  const huidHighlight = payload?.mode === 'huid';

  // When arriving with payload.mode === 'huid', scroll the HUID section into view
  useEffect(() => {
    if (huidHighlight && huidRef.current) {
      const t = setTimeout(() => {
        huidRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [huidHighlight]);

  const availableSourceCards = [
    overviewDoc,
    threeMarksDoc,
    huidDoc,
    redressalDoc
  ].filter(Boolean).map(doc => ({
    title: doc.title,
    sourceType: doc.source_name,
    reference: doc.section,
    url: doc.url
  }));

  // Build the source/trust section combining hallmarking docs + the standard source entry
  const allSources = [
    ...availableSourceCards,
    ...(is1417 ? [{
      title: is1417.title,
      sourceType: is1417.sourceRef?.sourceType || 'BIS Hallmarking Technical Regulation',
      reference: is1417.sourceRef?.clause || 'IS 1417: 2016',
      url: 'https://www.hallmarking.bis.gov.in/'
    }] : [])
  ].filter(Boolean);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-gov-md space-y-8 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm">
              HALLMARKING
            </Badge>
            <span className="text-xs text-slate-400">Gold & Silver Purity Reference</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            Hallmarking Guide
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Understand BIS hallmarking, HUID and consumer jewellery verification.
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
      <section className="bg-gradient-to-br from-yellow-50/70 to-amber-50 border border-amber-200/60 rounded-2xl p-6 sm:p-8 shadow-gov-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            BIS Hallmarking
          </h3>
          <Badge variant="gold" size="sm">BIS Reference Guide</Badge>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
          {overviewDoc
            ? overviewDoc.content
            : 'Hallmarking provides an indication of the purity/fineness of precious metal articles under the applicable BIS framework.'}
        </p>
        <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
          <Info className="w-3.5 h-3.5" />
          Based on BIS reference information in BISMITRA's knowledge base.
        </p>
      </section>

      {/* SECTION 2 — PRODUCT CONTEXT */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Gem className="w-4 h-4 text-yellow-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Product Context</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ContextRow label="Product" value={goldProduct?.product_name} />
          <ContextRow label="Scheme" value={goldProduct?.scheme_or_service} />
          <ContextRow label="Standard" value={goldProduct?.possible_standard || is1417?.standardNumber} />
        </div>
        {(goldProduct?.important_notes && goldProduct.important_notes.length > 0) && (
          <div className="pt-2 border-t border-slate-200/60 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Hallmarking / HUID context</p>
            <ul className="space-y-1">
              {goldProduct.important_notes.map((note, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-yellow-700 mt-0.5 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* SECTION 3 — THE 3 MANDATORY MARKS */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">The 3 Mandatory Marks</h3>
          <p className="text-xs text-slate-500">
            Every piece of hallmarked gold jewellery carries these 3 distinct laser-engraved marks.
          </p>
        </div>
        {threeMarksDoc && (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-4">
            {marksIntro}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MARKS.map((mark) => {
            const MarkIcon = mark.icon;
            return (
              <div key={mark.num} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 hover:border-amber-300 transition-all">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-yellow-100 text-yellow-800 shrink-0">
                    <MarkIcon className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Mark {mark.num}: {mark.title}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {mark.summary}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4 — HUID VERIFICATION */}
      <section ref={huidRef} className={`space-y-4 rounded-2xl p-5 sm:p-6 scroll-mt-24 ${huidHighlight ? 'bg-blue-50 border-2 border-gov-blue shadow-gov-md' : 'bg-slate-50 border border-slate-200'}`}>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Verify a HUID</h3>
          <p className="text-xs text-slate-500 max-w-2xl">
            {huidDoc?.content || 'Learn how to verify a hallmarked article using its HUID.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HUID_STEPS.map((step, i) => (
            <div key={step.title} className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gov-navy text-white flex items-center justify-center text-[11px] font-bold font-mono shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm font-bold text-slate-900">{step.title}</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            BISMITRA does not perform live HUID verification here. Use the BIS Care app for actual HUID verification.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => huidRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gov-navy hover:bg-blue-900 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-gov-sm"
          >
            <Search className="w-3.5 h-3.5" />
            Learn how to verify HUID
          </button>
          {huidDoc?.url && (
            <a
              href={huidDoc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              BIS HUID Reference
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </section>

      {/* SECTION 5 — HOW HALLMARKING WORKS */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">How Hallmarking Works</h3>
          <p className="text-xs text-slate-500">The journey of a hallmarked article.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-0">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gov-navy text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                  {i + 1}
                </div>
                {i < PROCESS_STEPS.length - 1 && <div className="w-0.5 flex-1 bg-slate-300 my-1" />}
              </div>
              <div className={i < PROCESS_STEPS.length - 1 ? 'pb-5' : ''}>
                <p className="text-sm font-bold text-slate-900">{step.label}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — STANDARD REFERENCE */}
      {is1417 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-700" />
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Relevant Standard</h3>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <p className="text-lg font-extrabold text-gov-navy font-mono tracking-tight">{is1417.standardNumber}</p>
              {is1417.mandatoryStatus && (
                <Badge variant="mandatory" size="sm">{is1417.mandatoryStatus}</Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-800">{is1417.title}</p>
            {is1417.scope && (
              <p className="text-xs text-slate-600 leading-relaxed">{is1417.scope}</p>
            )}
            {is1417.keyTests && is1417.keyTests.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Testing / Assaying methods</p>
                <ul className="space-y-1">
                  {is1417.keyTests.map((t) => (
                    <li key={t} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gov-green mt-0.5 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 7 — CONSUMER RIGHTS */}
      {redressalDoc && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Consumer Jewellery Rights</h3>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-800">{redressalDoc.title}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{redressalDoc.content}</p>
            {redressalDoc.document_title && (
              <p className="text-[11px] text-slate-400">
                Reference: {redressalDoc.document_title} — {redressalDoc.section}
              </p>
            )}
          </div>
        </section>
      )}

      {/* SECTION 8 — SOURCES & TRUST */}
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
    </div>
  );
}
