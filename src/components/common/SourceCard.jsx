import React from 'react';
import { BookOpen, CheckCircle2, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import Badge from './Badge';

export default function SourceCard({
  title = 'Indian Standard — Official Reference',
  sourceType = 'BIS Knowledge Source',
  reference = 'Section / Clause Reference',
  status = 'Verified Official Source',
  url = '',
  linkText = 'Official Source',
  onViewDetails,
  className = ''
}) {
  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 rounded-xl p-3.5 hover:border-blue-300 transition-all duration-200 shadow-xs ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100/70 text-blue-700 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 tracking-tight leading-snug line-clamp-1" title={title}>
              {title}
            </h4>
            <span className="text-[11px] font-medium text-slate-500 line-clamp-1">
              {sourceType}
            </span>
          </div>
        </div>
        <Badge variant="source" size="sm" className="whitespace-nowrap flex items-center gap-1 font-mono text-[10px] shrink-0">
          <ShieldCheck className="w-3 h-3 text-indigo-600" />
          {status}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 mt-2 text-slate-600">
        <div className="flex items-center gap-1.5 overflow-hidden pr-2">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-mono text-[11px] text-slate-700 font-medium truncate" title={reference}>
            {reference}
          </span>
        </div>

        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline shrink-0"
          >
            <span>{linkText}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : onViewDetails ? (
          <button
            onClick={onViewDetails}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer shrink-0"
          >
            <span>{linkText}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        ) : (
          <span className="text-[10px] text-slate-400 italic shrink-0">BIS Public Archive</span>
        )}
      </div>
    </div>
  );
}
