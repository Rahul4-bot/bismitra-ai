import React from 'react';
import { HelpCircle, Sparkles, Layers, FileCheck2, Gem, FlaskConical } from 'lucide-react';

export default function ExamplePromptPills({ onSelectPrompt, disabled }) {
  const examplePrompts = [
    {
      text: 'Which BIS standard applies to my product?',
      icon: Layers,
      color: 'hover:border-blue-300 hover:bg-blue-50/50 text-blue-700'
    },
    {
      text: 'How do I get BIS certification?',
      icon: FileCheck2,
      color: 'hover:border-amber-300 hover:bg-amber-50/50 text-amber-800'
    },
    {
      text: 'What is the hallmarking process?',
      icon: Gem,
      color: 'hover:border-yellow-300 hover:bg-yellow-50/50 text-yellow-800'
    },
    {
      text: 'Where can I find a testing laboratory?',
      icon: FlaskConical,
      color: 'hover:border-emerald-300 hover:bg-emerald-50/50 text-emerald-800'
    },
    {
      text: 'Which standard applies to electric iron?',
      icon: Sparkles,
      color: 'hover:border-indigo-300 hover:bg-indigo-50/50 text-indigo-700'
    },
    {
      text: 'How to verify ISI mark & report fake product?',
      icon: HelpCircle,
      color: 'hover:border-purple-300 hover:bg-purple-50/50 text-purple-800'
    }
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
        <span>Example Questions & Prompts</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {examplePrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.text)}
              disabled={disabled}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-slate-200 shadow-xs transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 ${item.color} hover:scale-[1.02]`}
            >
              <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" />
              <span>{item.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
