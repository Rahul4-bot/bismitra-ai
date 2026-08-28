import React from 'react';
import { ShieldCheck, User, Sparkles, ArrowRight, CornerDownRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import SourceCard from '../common/SourceCard';
import Badge from '../common/Badge';

export default function ChatMessage({ message, onNavigate, onSendPrompt }) {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 my-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="max-w-xl bg-gov-navy text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-gov-sm space-y-1">
          <p className="text-sm font-normal leading-relaxed text-slate-100">
            {message.text}
          </p>
          <div className="text-[10px] text-slate-300 text-right font-mono">
            {message.timestamp}
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Helper to format simple markdown-like strings (bold, headings, bullet points, code)
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');
    return (
      <div className="space-y-2 text-sm text-slate-800 leading-relaxed">
        {lines.map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={index} className="h-1" />;

          // Heading 3 (###)
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={index} className="text-base font-bold text-gov-navy pt-1 font-['Outfit',sans-serif]">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }

          // Bullet point (- or *)
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            return (
              <div key={index} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gov-blue mt-2 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: parseBold(content) }} />
              </div>
            );
          }

          // Numbered list (1. , 2. )
          const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numberMatch) {
            return (
              <div key={index} className="flex items-start gap-2 pl-1">
                <span className="font-bold text-xs text-gov-blue font-mono bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                  {numberMatch[1]}
                </span>
                <span dangerouslySetInnerHTML={{ __html: parseBold(numberMatch[2]) }} />
              </div>
            );
          }

          // Disclaimer block (*Note: ...*)
          if (trimmed.startsWith('*Note:') || trimmed.startsWith('_Note:')) {
            return (
              <div key={index} className="pt-2 text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span dangerouslySetInnerHTML={{ __html: parseBold(trimmed) }} />
              </div>
            );
          }

          // Normal paragraph with bold parsing
          return (
            <p key={index} dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
          );
        })}
      </div>
    );
  };

  const parseBold = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-700 italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-gov-blue font-mono text-xs font-semibold">$1</code>');
  };

  const isLowConfidence = message.confidence === 'low';

  return (
    <div className="flex items-start gap-3 my-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* BIS Assistant Avatar */}
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${isLowConfidence ? 'from-slate-700 to-slate-800' : 'from-gov-navy to-gov-navyLight'} text-white flex items-center justify-center shadow-md shadow-gov-navy/20 shrink-0 border border-slate-700 mt-0.5`}>
        <ShieldCheck className="w-4 h-4 text-gov-saffron" />
      </div>

      <div className="flex-1 max-w-3xl space-y-4">
        {/* Main Response Box */}
        <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-5 shadow-gov-sm space-y-4">
          
          {/* Header indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-gov-navy font-['Outfit',sans-serif]">
                BISMITRA AI Response
              </span>
              <Badge variant={isLowConfidence ? 'default' : 'source'} size="sm">
                {isLowConfidence ? (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-500 mr-1 inline" />
                    Unverified Query
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-gov-saffron mr-1 inline" />
                    Verified Grounded Knowledge
                  </>
                )}
              </Badge>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {message.timestamp}
            </span>
          </div>

          {/* Body */}
          {renderFormattedText(message.text)}

          {/* Sources Section */}
          {message.sources && message.sources.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Verified Sources & References
                </span>
                <span className="text-[11px] text-slate-400">
                  {message.sources.length} {message.sources.length === 1 ? 'Official Citation' : 'Official Citations'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {message.sources.map((src, idx) => (
                  <SourceCard
                    key={idx}
                    title={src.docTitle || src.title}
                    sourceType={src.sourceType}
                    reference={src.clause || src.reference}
                    status={src.status || 'Verified Official Source'}
                    url={src.url}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Suggested Next Action Buttons */}
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="pl-1 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <CornerDownRight className="w-3.5 h-3.5 text-gov-blue" />
              <span>Suggested Next Steps & Workflows</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.suggestedActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (action.targetTab && onNavigate) {
                      onNavigate(action.targetTab, action.payload);
                    } else if (action.payloadText && onSendPrompt) {
                      onSendPrompt(action.payloadText);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-gov-blue text-slate-700 hover:text-white border border-slate-200 hover:border-gov-blue shadow-xs transition-all duration-150 group cursor-pointer"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
