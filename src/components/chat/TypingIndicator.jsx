import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 my-4 animate-in fade-in duration-300">
      {/* BIS Avatar */}
      <div className="w-8 h-8 rounded-lg bg-gov-navy text-white flex items-center justify-center shadow-sm shrink-0 border border-slate-700">
        <ShieldCheck className="w-4 h-4 text-gov-saffron" />
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm px-4 py-3 shadow-gov-sm flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gov-blue animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-gov-blue animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-gov-blue animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-gov-saffron" />
          BISMITRA is analyzing Indian Standards & Gazette clauses...
        </span>
      </div>
    </div>
  );
}
