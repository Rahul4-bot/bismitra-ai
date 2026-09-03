import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { UNAVAILABLE } from '../../constants/productJourney.js';

function FieldRow({ label, value }) {
  if (value == null) return null;
  const text = Array.isArray(value) ? value.join(', ') : String(value);
  const unavailable = text === UNAVAILABLE;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-3 py-1.5 border-b border-slate-100 last:border-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:w-36 shrink-0">
        {label}
      </dt>
      <dd className={`text-xs ${unavailable ? 'text-slate-400 italic' : 'text-slate-800'}`}>{text}</dd>
    </div>
  );
}

export default function JourneyTimeline({ stages = [] }) {
  const [openId, setOpenId] = useState(stages[0]?.id || null);
  const visible = stages.filter((s) => s.present);

  if (visible.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No journey stages could be built from the connected BIS data.
      </p>
    );
  }

  return (
    <ol className="space-y-0">
      {visible.map((stage, index) => {
        const open = openId === stage.id;
        const fields = stage.fields || {};
        return (
          <li key={stage.id} className="relative pl-12 pb-5 last:pb-0">
            {index < visible.length - 1 && (
              <span className="absolute left-[18px] top-10 bottom-0 w-px bg-slate-200" aria-hidden />
            )}
            <span className="absolute left-0 top-0 w-9 h-9 rounded-xl bg-gov-navy text-gov-saffron text-[11px] font-bold flex items-center justify-center">
              {String(index + 1).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : stage.id)}
              className="w-full text-left bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {stage.title}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{stage.summary}</p>
                  {stage.sourceLabel && (
                    <p className="text-[11px] text-slate-500 mt-1">Source: {stage.sourceLabel}</p>
                  )}
                </div>
                {open ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>
              {open && (
                <dl className="mt-3 pt-3 border-t border-slate-100">
                  {Object.entries(fields).map(([key, val]) => (
                    <FieldRow
                      key={key}
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                      value={val}
                    />
                  ))}
                </dl>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
