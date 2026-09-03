import React, { useRef, useEffect } from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Search,
  Info,
  ExternalLink,
  BookOpen,
  PhoneCall,
  Gem,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText
} from 'lucide-react';
import Badge from '../common/Badge';
import SourceCard from '../common/SourceCard';

// Verified BIS knowledge data reused directly (imported by path)
import consumerDocs from '../../data/knowledge/documents/consumer.json';
import hallmarkDocs from '../../data/knowledge/documents/hallmarking.json';
import sourcesData from '../../data/sources.json';

// Look up the verified consumer documents (safe lookups)
const isiVerificationDoc = consumerDocs.find(d => d.id === 'doc_consumer_001_isi_verification');
const fakeIsiDoc = consumerDocs.find(d => d.id === 'doc_consumer_002_fake_isi_reporting');
const helplineDoc = consumerDocs.find(d => d.id === 'doc_consumer_003_helpline_redressal');
const qcoDoc = consumerDocs.find(d => d.id === 'doc_consumer_004_qco_penalties');
const huidDoc = hallmarkDocs.find(d => d.id === 'doc_hallmark_003_huid_verification');
const redressalDoc = hallmarkDocs.find(d => d.id === 'doc_hallmark_004_consumer_redressal');
const consumerSource = sourcesData.find(s => s.id === 'src-consumer-rights');

// Verified official BIS / consumer URLs — present in the knowledge base only
export const CONSUMER_URLS = {
  bisCare: 'https://bis.gov.in/consumer-engagement-overview/',
  manakonline: 'https://www.manakonline.in/',
  helpline: 'https://consumerhelpline.gov.in/',
  bisAct: 'https://bis.gov.in/the-bis-act-2016/',
  bisMain: 'https://bis.gov.in/',
  hallmarking: 'https://www.hallmarking.bis.gov.in/',
  crs: 'https://www.crsbis.in/BIS/'
};

// License validity statuses — exactly as stated in doc_consumer_001
const VALIDITY_STATUSES = ['Operative', 'Expired', 'Suspended', 'Cancelled'];

// 3-step "Check Before You Buy" flow — grounded in doc_consumer_001
const CHECK_STEPS = [
  {
    title: 'Locate the ISI mark / CM/L number',
    desc: 'Find the BIS Standard Mark on the product, along with its 7 or 8-digit Certification Marks Licence (CM/L) number.'
  },
  {
    title: 'Check the licence details',
    desc: 'Use the "Verify License Details" feature in the BIS Care app, or search on the Manakonline portal, entering the CM/L number.'
  },
  {
    title: 'Review the returned information',
    desc: 'Review the licensee name/address, brand and model, current validity status, and the Indian Standard number returned.'
  }
];

const OFFICIAL_RESOURCES = [
  { name: 'BIS Consumer Engagement / BIS Care', url: CONSUMER_URLS.bisCare, desc: 'Verify license details, complaints, and consumer services.' },
  { name: 'Manakonline', url: CONSUMER_URLS.manakonline, desc: 'BIS certification application and license lookup portal.' },
  { name: 'National Consumer Helpline', url: CONSUMER_URLS.helpline, desc: 'National consumer helpline 1915 and online resources.' },
  { name: 'BIS Act, 2016', url: CONSUMER_URLS.bisAct, desc: 'Bureau of Indian Standards Act reference text.' },
  { name: 'BIS Main Portal', url: CONSUMER_URLS.bisMain, desc: 'Bureau of Indian Standards official website.' },
  { name: 'Hallmarking Portal', url: CONSUMER_URLS.hallmarking, desc: 'BIS gold/silver hallmarking and HUID resources.' },
  { name: 'CRS Portal', url: CONSUMER_URLS.crs, desc: 'Compulsory Registration Scheme (R-number) resources.' }
];

export default function ConsumerHelpPage({ onNavigate, payload = null }) {
  const isiRef = useRef(null);
  const isiHighlight = payload?.mode === 'isi';

  // When arriving with payload.mode === 'isi', highlight and scroll to ISI verification
  useEffect(() => {
    if (isiHighlight && isiRef.current) {
      const t = setTimeout(() => {
        isiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isiHighlight]);

  // Graceful fallback if core consumer knowledge is unavailable
  if (!consumerDocs || consumerDocs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-gov-md text-center space-y-4">
        <p className="text-sm text-slate-600">Consumer information is currently unavailable.</p>
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
            <Badge variant="source" size="sm">CONSUMER HELP</Badge>
            <span className="text-xs text-slate-400">BIS Knowledge Reference</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            Consumer Help Guide
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Verify product information, understand BIS marks and know where to seek consumer support.
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
      <section className="bg-gradient-to-br from-indigo-50/70 to-blue-50 border border-indigo-200/60 rounded-2xl p-6 sm:p-8 shadow-gov-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            Consumer Help
          </h3>
          <Badge variant="primary" size="sm">BIS Reference Guide</Badge>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
          Verify product information, understand BIS marks and know where to seek consumer support.
          BISMITRA explains the consumer guidance available in its knowledge base — it does not
          perform live BIS verification.
        </p>
        <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
          <Info className="w-3.5 h-3.5" />
          Based on BIS reference information available in BISMITRA's knowledge base.
        </p>
      </section>

      {/* SECTION 2 — CHECK BEFORE YOU BUY */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Check Before You Buy</h3>
          <p className="text-xs text-slate-500">
            Check the ISI mark, CM/L licence information and product/standard details before purchasing.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-0">
          {CHECK_STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gov-navy text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                  {i + 1}
                </div>
                {i < CHECK_STEPS.length - 1 && <div className="w-0.5 flex-1 bg-slate-300 my-1" />}
              </div>
              <div className={i < CHECK_STEPS.length - 1 ? 'pb-5' : ''}>
                <p className="text-sm font-bold text-slate-900">{step.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — ISI / CM/L VERIFICATION */}
      <section ref={isiRef} className={`space-y-4 rounded-2xl p-5 sm:p-6 scroll-mt-24 ${isiHighlight ? 'bg-indigo-50 border-2 border-indigo-400 shadow-gov-md' : 'bg-slate-50 border border-slate-200'}`}>
        {isiHighlight && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-700 shrink-0" />
            <p className="text-xs text-blue-800 font-semibold">You came here to verify an ISI mark / CM/L number.</p>
          </div>
        )}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Verify an ISI Mark / CM/L</h3>
          <p className="text-xs text-slate-500 max-w-2xl">
            {isiVerificationDoc?.content || 'Learn how to verify an ISI mark using its CM/L number.'}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            BISMITRA's product verification uses local knowledge records and is <strong>not</strong> a live BIS
            database lookup. Use the BIS Care app or Manakonline to confirm a licence against official BIS data.
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-2">
          <FileText className="w-4 h-4 text-indigo-700 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-800 leading-relaxed">
            For a BISMITRA knowledge check on a scanned product identifier, use the product
            verification flow on the home / scanner. BISMITRA recognises product IDs, CM/L and R- numbers,
            IS codes, barcodes and batch numbers against its local knowledge base.
          </p>
        </div>
      </section>

      {/* SECTION 4 — OFFICIAL ISI VERIFICATION */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Official ISI Verification</h3>
          <p className="text-xs text-slate-500">Confirm licence details through official BIS channels.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={CONSUMER_URLS.bisCare}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 hover:border-indigo-300 transition-all block"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <p className="text-sm font-bold text-slate-900">Verify through BIS Care</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use the "Verify License Details" feature in the BIS Care mobile app.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
              Open BIS Care
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>
          <a
            href={CONSUMER_URLS.manakonline}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 hover:border-indigo-300 transition-all block"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <p className="text-sm font-bold text-slate-900">Check on Manakonline</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Search licence details using the CM/L number on the Manakonline portal.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
              Open Manakonline
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        </div>
        <p className="text-[11px] text-slate-400 italic">External BIS reference — BISMITRA does not perform live verification.</p>
      </section>

      {/* SECTION 5 — WHAT A VERIFICATION RESULT MEANS */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">What Can You Check?</h3>
          <p className="text-xs text-slate-500">A CM/L verification can return licence information.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {['Licensee name/address', 'Brand & model', 'Validity status', 'Indian Standard number'].map((label) => (
            <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-2" />
              <p className="text-xs font-semibold text-slate-800">{label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Validity statuses</p>
          <div className="flex flex-wrap gap-2">
            {VALIDITY_STATUSES.map(status => (
              <Badge key={status} variant="default" size="sm">{status}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — HALLMARK & HUID */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Gem className="w-4 h-4 text-yellow-700" />
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Gold Jewellery & HUID</h3>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            {huidDoc?.content || 'Hallmarked jewellery can be checked using HUID information via the BIS Care app.'}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              BISMITRA does not perform live HUID verification here. Use the BIS Care app for actual HUID verification.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate('hallmarking')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gov-navy hover:bg-blue-900 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-gov-sm"
            >
              Open Hallmarking Guide
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {huidDoc?.url && (
              <a
                href={huidDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                BIS Care HUID Reference
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 7 — REPORT A COUNTERFEIT ISI MARK */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Found a Suspected Fake ISI Mark?</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs text-slate-700 leading-relaxed">
            {fakeIsiDoc?.content || 'Consumers can report counterfeit marks through the BIS Care app or the BIS grievance portal.'}
          </p>
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Preserve and provide</p>
            <ul className="space-y-1">
              {['Product photographs showing the mark and label', 'Seller/shop name and address', 'Purchase bill / cash memo (if available)'].map((item, i) => (
                <li key={item} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                  {i + 1}. {item}
                </li>
              ))}
            </ul>
          </div>
          <a
            href={CONSUMER_URLS.bisCare}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-gov-sm"
          >
            Open BIS Consumer Resources
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <p className="text-[11px] text-slate-400 italic">External BIS reference.</p>
        </div>
      </section>

      {/* SECTION 8 — CONSUMER RIGHTS & REDRESSAL */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Consumer Rights & Redressal</h3>
          <p className="text-xs text-slate-500">Where to seek support for certified goods.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-bold text-slate-900">National Consumer Helpline</p>
            </div>
            <p className="text-lg font-extrabold text-gov-navy font-mono">1915</p>
            <p className="text-xs text-slate-600 leading-relaxed">consumerhelpline.gov.in</p>
            <a
              href={CONSUMER_URLS.helpline}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              Open Consumer Helpline
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <p className="text-sm font-bold text-slate-900">BIS Consumer Services</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              BIS Branch Offices maintain Public Grievance Officers and consumer protection cells covering
              certified goods, hallmarked jewellery and lab testing disputes.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4 text-yellow-700" />
              <p className="text-sm font-bold text-slate-900">Hallmarked Jewellery</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {redressalDoc?.content || 'Hallmarked jewellery with lower purity than marked may entitle the consumer to compensation.'}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 9 — LEGAL / QCO INFORMATION */}
      {qcoDoc && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Mandatory QCOs & Consumer Protection</h3>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">{qcoDoc.content}</p>
            <p className="text-[11px] text-slate-400">
              Reference: {qcoDoc.document_title} — {qcoDoc.section}
            </p>
            <p className="text-[11px] text-slate-400 italic">
              Refer to the applicable legislation and official BIS resources for authoritative legal information.
            </p>
            <a
              href={CONSUMER_URLS.bisAct}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              BIS Act, 2016 Reference
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      )}

      {/* SECTION 10 — FIND THE RIGHT BISMITRA TOOL */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">What do you need?</h3>
          <p className="text-xs text-slate-500">Jump to the BISMITRA tool that matches your need.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('find-standard')}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-2"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">Find My Standard</p>
              <p className="text-xs text-slate-500">Identify applicable Indian Standards.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
          </button>
          <button
            onClick={() => onNavigate('hallmarking')}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left hover:border-yellow-300 transition-all cursor-pointer flex items-center justify-between gap-2"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">Hallmarking Guide</p>
              <p className="text-xs text-slate-500">Gold/silver hallmarking & HUID guidance.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-yellow-600 shrink-0" />
          </button>
          <button
            onClick={() => onNavigate('labs')}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between gap-2"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">Testing & Labs</p>
              <p className="text-xs text-slate-500">Understand testing requirements.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
          </button>
          <button
            onClick={() => onNavigate('certification')}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between gap-2"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">Certification Guide</p>
              <p className="text-xs text-slate-500">The BIS certification roadmap.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
          </button>
        </div>
      </section>

      {/* SECTION 11 — OFFICIAL RESOURCES */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Official Resources</h3>
          <p className="text-xs text-slate-500">External BIS and consumer resources.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OFFICIAL_RESOURCES.map(res => (
            <a
              key={res.name}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 hover:border-indigo-300 transition-all block"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{res.name}</p>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
              <p className="text-xs text-slate-500">{res.desc}</p>
            </a>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 italic">External BIS reference.</p>
      </section>

      {/* SECTION 12 — SOURCES & TRUST */}
      {(consumerDocs.length > 0 || consumerSource) && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Information Sources</h3>
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Based on BIS reference information available in BISMITRA's knowledge base.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[isiVerificationDoc, fakeIsiDoc, helplineDoc, qcoDoc, huidDoc, redressalDoc].filter(Boolean).map((doc, i) => (
              <SourceCard
                key={i}
                title={doc.title}
                sourceType={doc.source_name}
                reference={doc.section}
                status="Verified BIS reference"
                url={doc.url || ''}
                linkText="View Source"
              />
            ))}
            {consumerSource && (
              <SourceCard
                title={consumerSource.title}
                sourceType={consumerSource.sourceType}
                reference={consumerSource.reference}
                status="Source-backed prototype response"
                url=""
                linkText="View Source"
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
