import React from 'react';
import { HelpCircle, Sparkles, Layers, FileCheck2, Gem, FlaskConical, ShieldCheck, Zap, Droplets } from 'lucide-react';

export default function ExamplePromptPills({ onSelectPrompt, disabled }) {
  const examplePrompts = [
    {
      text: 'Which standard applies to electric iron?',
      label: 'Electric Iron (IS 302)',
      icon: Zap,
      color: 'hover:border-indigo-300 hover:bg-indigo-50/50 text-indigo-700'
    },
    {
      text: 'Which BIS standard applies to Packaged Drinking Water?',
      label: 'Drinking Water (IS 14543)',
      icon: Droplets,
      color: 'hover:border-sky-300 hover:bg-sky-50/50 text-sky-700'
    },
    {
      text: 'What are the 3 mandatory marks on hallmarked gold jewellery?',
      label: 'Gold 3 Marks & HUID',
      icon: Gem,
      color: 'hover:border-amber-300 hover:bg-amber-50/50 text-amber-800'
    },
    {
      text: 'What are the general 7 steps in the BIS certification process?',
      label: '7-Step ISI Process',
      icon: FileCheck2,
      color: 'hover:border-blue-300 hover:bg-blue-50/50 text-blue-700'
    },
    {
      text: 'What is CRS and how does it differ from ISI certification?',
      label: 'CRS Scheme-II vs ISI',
      icon: Layers,
      color: 'hover:border-teal-300 hover:bg-teal-50/50 text-teal-700'
    },
    {
      text: 'How can a consumer verify if an ISI mark or CM/L license number is genuine?',
      label: 'Verify CM/L & Report Fake',
      icon: ShieldCheck,
      color: 'hover:border-purple-300 hover:bg-purple-50/50 text-purple-800'
    },
    {
      text: 'How can a manufacturer find a BIS Central or Recognized testing laboratory?',
      label: 'Find Testing Labs (LRS)',
      icon: FlaskConical,
      color: 'hover:border-emerald-300 hover:bg-emerald-50/50 text-emerald-800'
    }
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
          <span>Suggested Verified Scenarios</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
          1-Click Verified Demo Prompts
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {examplePrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.text)}
              disabled={disabled}
              title={item.text}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-slate-200 shadow-2xs transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 ${item.color} hover:scale-[1.02]`}
            >
              <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
