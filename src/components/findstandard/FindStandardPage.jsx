import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  ExternalLink,
  RotateCcw,
  FileText,
  Info
} from 'lucide-react';
import Badge from '../common/Badge';
import SourceCard from '../common/SourceCard';
import { findStandard } from '../../services/findStandardService';

const EXAMPLES = [
  { label: 'Pressure Cooker', query: 'Pressure Cooker' },
  { label: 'LED Bulb', query: 'LED Bulb' },
  { label: 'Cement', query: 'Cement' },
  { label: 'Helmet', query: 'Two wheeler helmet' },
];

const LOADING_STEPS = [
  'Reading product information...',
  'Extracting product attributes...',
  'Searching BIS standards database...',
  'Calculating match relevance...',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function FindStandardPage({ onNavigate }) {
  const [phase, setPhase] = useState('input');
  const [query, setQuery] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const runSearch = async (searchQuery) => {
    const trimmed = (searchQuery || '').trim();
    if (!trimmed) return;

    setError('');
    setQuery(trimmed);
    setPhase('loading');
    setStepIndex(0);

    for (let i = 0; i < LOADING_STEPS.length; i += 1) {
      setStepIndex(i);
      await sleep(200);
    }

    const data = await findStandard(trimmed);

    if (data.errorCode === 'network' || data.errorCode === 'empty') {
      setError(data.message);
      setPhase('input');
      return;
    }

    if (!data.ok) {
      setError(data.error || 'Unable to analyze the product right now.');
      setPhase('input');
      return;
    }

    setResult(data);
    setPhase(data.found ? 'result' : 'no-match');
  };

  const reset = () => {
    setPhase('input');
    setResult(null);
    setError('');
    setQuery('');
    setStepIndex(0);
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      runSearch(query);
    }
  };

  const handleStartCompliance = () => {
    if (result?.complianceNavigation) {
      onNavigate(result.complianceNavigation.targetTab, result.complianceNavigation.payload);
    } else {
      onNavigate('certification', {
        product: result?.primaryStandard?.title || query,
        standard: result?.primaryStandard?.standardNumber || '',
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-gov-md space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              FIND STANDARD
            </Badge>
            <span className="text-xs text-slate-400">AI-Powered Standard Matching</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            Find the Right BIS Standard for Your Product
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Enter your product name or describe your product in simple words. BISMITRA AI will identify the most relevant Indian Standard.
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-gov-navy bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          ← Return to Home & Chat
        </button>
      </div>

      {/* INPUT PHASE */}
      {phase === 'input' && (
        <div className="space-y-5">
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Box */}
          <div className="max-w-2xl">
            <label htmlFor="find-standard-input" className="sr-only">
              Product name or description
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="find-standard-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Stainless steel pressure cooker, 5 litre"
                  className="w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue/30 focus:border-gov-blue transition-all placeholder:text-slate-400"
                  autoComplete="off"
                />
              </div>
              <button
                onClick={() => runSearch(query)}
                disabled={!query.trim()}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gov-navy hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-xl transition-all cursor-pointer shadow-gov-sm hover:shadow-gov-md whitespace-nowrap"
              >
                Find My Standard
              </button>
            </div>
          </div>

          {/* AI Indicator */}
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            AI-powered • BIS-focused • Source-backed
          </p>

          {/* Example Searches */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600">Try an example</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => handleExampleClick(ex.query)}
                  className="text-xs font-medium text-gov-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOADING PHASE */}
      {phase === 'loading' && (
        <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-gov-blue mx-auto animate-spin" />
          <p className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
            Finding Standard...
          </p>
          <p className="text-xs text-slate-500">{LOADING_STEPS[stepIndex]}</p>
        </div>
      )}

      {/* RESULT PHASE */}
      {phase === 'result' && result && (
        <div className="space-y-6">

          {/* Search Result Label */}
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Search Result
          </p>

          {/* Product Identified */}
          {result.productIdentification && Object.keys(result.productIdentification).length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gov-green" />
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Product Identified
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {result.productIdentification.productType && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Product Type</p>
                    <p className="text-xs font-semibold text-slate-900">{result.productIdentification.productType}</p>
                  </div>
                )}
                {result.productIdentification.category && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Category</p>
                    <p className="text-xs font-semibold text-slate-900">{result.productIdentification.category}</p>
                  </div>
                )}
                {result.productIdentification.material && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Material</p>
                    <p className="text-xs font-semibold text-slate-900">{result.productIdentification.material}</p>
                  </div>
                )}
                {result.productIdentification.intendedUse && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Intended Use</p>
                    <p className="text-xs font-semibold text-slate-900">{result.productIdentification.intendedUse}</p>
                  </div>
                )}
                {result.productIdentification.capacity && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Capacity / Size</p>
                    <p className="text-xs font-semibold text-slate-900">{result.productIdentification.capacity}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MOST RELEVANT STANDARD */}
          {result.primaryStandard && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Most Relevant Standard
              </h3>

              <div className="bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-200/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-gov-sm">
                {/* Standard number + title */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-lg sm:text-xl font-extrabold text-gov-navy font-mono tracking-tight">
                      {result.primaryStandard.standardNumber}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 leading-snug max-w-xl">
                      {result.primaryStandard.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="primary" size="md">
                      {result.primaryStandard.relevance}% Match
                    </Badge>
                    {result.primaryStandard.scheme && (
                      <Badge variant="mandatory" size="sm">
                        {result.primaryStandard.scheme.includes('CRS') ? 'CRS' : result.primaryStandard.scheme.includes('Hallmark') ? 'Hallmarking' : 'ISI'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Scope */}
                {result.primaryStandard.scope && (
                  <p className="text-xs text-slate-600 leading-relaxed border-t border-blue-100 pt-3">
                    {result.primaryStandard.scope}
                  </p>
                )}

                {/* Mandatory Status */}
                {result.primaryStandard.mandatoryStatus && (
                  <div className="flex items-center gap-2">
                    <Badge variant="mandatory" size="sm">
                      {result.primaryStandard.mandatoryStatus}
                    </Badge>
                  </div>
                )}

                {/* Why this standard */}
                <div className="bg-white/70 border border-slate-100 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-gov-blue" />
                    <p className="text-xs font-bold text-slate-900">Why did BISMITRA recommend this?</p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {result.primaryStandard.explanation}
                  </p>
                  {result.primaryStandard.matchingFactors && result.primaryStandard.matchingFactors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {result.primaryStandard.matchingFactors.map((factor, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium text-gov-green bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {factor}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Source */}
                {result.primaryStandard.sourceRef && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-blue-100">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">Source:</span>
                    <span className="text-slate-600">{result.primaryStandard.sourceRef.docTitle || result.primaryStandard.sourceRef.sourceType}</span>
                    {result.primaryStandard.sourceRef.clause && (
                      <span className="text-slate-400">— {result.primaryStandard.sourceRef.clause}</span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={handleStartCompliance}
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-gov-navy hover:bg-blue-900 px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-gov-sm hover:shadow-gov-md"
                  >
                    Start Compliance Journey
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (result.primaryStandard.standardNumber) {
                        onNavigate('find-standard', { standard: result.primaryStandard.standardNumber });
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-gov-navy bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    View Standard Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other Related Standards */}
          {result.otherStandards && result.otherStandards.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Other Related Standards
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.otherStandards.map((std) => (
                  <div
                    key={std.standardNumber}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 font-mono">{std.standardNumber}</p>
                      <Badge variant="default" size="sm">{std.relevance}%</Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug line-clamp-2">{std.title}</p>
                    <p className="text-[10px] text-slate-400">{std.category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Cards */}
          {result.sources && result.sources.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Source-backed BIS Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.sources.map((src, i) => (
                  <SourceCard
                    key={i}
                    title={src.title}
                    sourceType={src.sourceType}
                    reference={src.reference}
                    status={src.status}
                    url={src.url}
                    linkText="View Source"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Try Another Search */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-gov-navy transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Search for another product
            </button>
          </div>
        </div>
      )}

      {/* NO MATCH PHASE */}
      {phase === 'no-match' && (
        <div className="space-y-5">
          <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-xs">
              <Search className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                We couldn't confidently identify a standard.
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                Try adding more details such as:
              </p>
              <ul className="text-xs text-slate-600 text-left max-w-xs mx-auto space-y-1 pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                  Product material
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                  Intended use
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                  Product type
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                  Capacity / size
                </li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              BISMITRA does not recommend a standard when the available information is insufficient.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gov-navy hover:bg-blue-900 px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-gov-sm"
            >
              Try Again
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
