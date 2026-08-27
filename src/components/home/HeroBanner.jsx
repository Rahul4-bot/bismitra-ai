import React from 'react';
import { Sparkles, ShieldCheck, FileCheck, Layers, Award, Landmark } from 'lucide-react';
import Badge from '../common/Badge';

export default function HeroBanner() {
  return (
    <div className="relative bg-gradient-to-br from-gov-navy via-[#0C3054] to-gov-navyDark rounded-3xl p-6 sm:p-10 text-white shadow-gov-lg overflow-hidden border border-slate-700/60">
      
      {/* Subtle Background Glow Elements */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-20 w-64 h-64 bg-gov-saffron/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-4xl">
        
        {/* Top Badges & Ministry Branding */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-gov-saffron border border-white/15 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
            <span>Smart India Hackathon (SIH) Prototype</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-xs font-medium text-slate-300 border border-slate-700 backdrop-blur-md">
            <Landmark className="w-3.5 h-3.5 text-blue-400" />
            <span>Bureau of Indian Standards • Govt. of India</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-['Outfit',sans-serif] leading-tight">
            BISMITRA <span className="text-gov-saffron">AI</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-200 font-medium max-w-2xl leading-relaxed">
            Your intelligent assistant for Indian Standards and BIS services.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Empowering Indian manufacturers, MSMEs, testing laboratories, and 1.4 billion consumers with AI-guided standard discovery, 7-step compliance roadmaps, and hallmarking verification.
          </p>
        </div>

        {/* Quick Highlights / Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { label: 'Indian Standards (IS)', value: '21,000+', icon: Layers },
            { label: 'Mandatory QCO Orders', value: '600+', icon: Award },
            { label: 'Certified Labs Network', value: '1,200+', icon: ShieldCheck },
            { label: 'AI Assistance', value: 'Instant / 24x7', icon: Sparkles },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs flex items-center gap-3"
              >
                <div className="p-2 rounded-xl bg-white/10 text-gov-saffron shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-white font-['Outfit',sans-serif]">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
