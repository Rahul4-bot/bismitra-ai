import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Badge from '../common/Badge';
import SourceCard from '../common/SourceCard';
import VerificationStatus from './VerificationStatus';
import JourneyTimeline from './JourneyTimeline';
import { UNAVAILABLE } from '../../constants/productJourney.js';

function SummaryRow({ label, value }) {
  const unavailable = !value || value === UNAVAILABLE;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-sm font-semibold ${unavailable ? 'text-slate-400 italic' : 'text-slate-900'}`}>
        {unavailable ? UNAVAILABLE : value}
      </span>
    </div>
  );
}

export default function ProductJourneyView({ result, onReset }) {
  const journey = result?.journey;
  const isDemo = journey?.dataSource === 'demo';
  const status = journey?.verification?.status || 'NOT_FOUND';
  const std = journey?.applicableStandards?.[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" size="sm">
              Available Product Journey
            </Badge>
            {isDemo && (
              <Badge variant="warning" size="sm">
                Demo data
              </Badge>
            )}
            {journey?.coverage && (
              <Badge variant="default" size="sm">
                Journey coverage: {journey.coverage.verifiedStages} of {journey.coverage.totalStages} stages
              </Badge>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] mt-2">
            {status === 'NOT_FOUND' ? 'Product could not be verified' : journey.productName}
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-gov-navy bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Scan another product
        </button>
      </div>

      {isDemo && journey.demoDisclaimer && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {journey.demoDisclaimer}
        </p>
      )}

      {status !== 'NOT_FOUND' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-gov-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gov-blue" />
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">Product summary</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SummaryRow label="Product name" value={journey.productName} />
            <SummaryRow label="Product ID / identifier" value={journey.productId} />
            <SummaryRow label="Manufacturer" value={journey.manufacturer} />
            <SummaryRow label="Category" value={journey.category} />
            <SummaryRow label="Applicable BIS standard" value={std?.code} />
            <SummaryRow label="Certification / licence status" value={journey.bisStatus} />
            <SummaryRow label="Verification" value={status} />
          </div>
          {std?.code && (
            <p className="text-[11px] text-slate-500">
              Applicable Standard: {std.code}
              {std.name ? ` — ${std.name}` : ''}. Source:{' '}
              {isDemo ? 'Isolated demo dataset' : 'BIS database / connected BIS document'}.
            </p>
          )}
        </div>
      )}

      <VerificationStatus
        status={status}
        isDemo={isDemo}
        missingFields={journey?.verification?.missingFields || []}
      />

      {result?.explanation && (
        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">
            Consumer explanation
            {result.explanationProvider === 'fallback' ? ' (generated from structured data)' : ''}
            {result.explanationProvider === 'gemini' ? ' (optional AI rewrite of structured facts)' : ''}
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{result.explanation}</p>
        </div>
      )}

      {status !== 'NOT_FOUND' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-gov-sm">
          <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif] mb-4">
            Available journey
          </h3>
          <JourneyTimeline stages={journey.stages || []} />
        </div>
      )}

      {journey?.meaning && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-900 mb-1">What does this verification mean?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{journey.meaning.verified}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-900 mb-1">What could not be verified?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{journey.meaning.notVerified}</p>
          </div>
        </div>
      )}

      {Array.isArray(result?.journey?.sources) && result.journey.sources.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.journey.sources.map((src, idx) => (
              <SourceCard
                key={`${src.document}-${idx}`}
                title={src.document || src.source_name}
                sourceType={src.dataSource === 'demo' ? 'Demo dataset (not official BIS)' : src.source_name}
                reference={src.page_or_section}
                status={src.dataSource === 'demo' ? 'Demo data' : src.verification_status === 'verified' ? 'Verified Official Source' : 'Connected source'}
                url={src.url}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
