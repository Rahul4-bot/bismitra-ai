import React from 'react';
import { ShieldCheck, ExternalLink, HelpCircle, PhoneCall, Mail, Award, CheckCircle } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-gov-navy text-slate-300 border-t border-slate-800 text-sm mt-16">
      {/* Tricolor Accent */}
      <div className="gov-tricolor-bar w-full opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Ministry Details */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gov-navyLight border border-slate-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-gov-saffron" />
              </div>
              <span className="font-bold text-lg text-white font-['Outfit',sans-serif]">
                BISMITRA <span className="text-gov-saffron">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered Intelligent Assistant for Indian Standards and BIS Services, empowering manufacturers, laboratories, and Indian consumers.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-800/90 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
                <Award className="w-3 h-3 text-gov-saffron" />
                SIH Prototype • Phase 1
              </span>
            </div>
          </div>

          {/* Col 2: Core Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Prototype Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => { setActiveTab('find-standard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Product Standard Finder
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('certification'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gov-saffron" />
                  7-Step Compliance Roadmap
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('hallmarking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  Hallmarking & HUID Checker
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('labs'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Testing Laboratories Directory
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('consumer'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Consumer Grievance & Help
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Official References */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Official Portals & References
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ExternalLink className="w-3 h-3 text-slate-500" />
                <span>BIS Official Portal (bis.gov.in)</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ExternalLink className="w-3 h-3 text-slate-500" />
                <span>Manakonline Certification Portal</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ExternalLink className="w-3 h-3 text-slate-500" />
                <span>BIS Care Mobile Application</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <ExternalLink className="w-3 h-3 text-slate-500" />
                <span>National Consumer Helpline (NCH)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Consumer Helpline & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Helplines & Support
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-gov-saffron" />
                <div>
                  <div className="font-semibold text-white">National Consumer Helpline</div>
                  <div className="text-[11px] text-slate-400">Toll Free: 1915 / 1800-11-4000</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-semibold text-white">BIS Public Grievance</div>
                  <div className="text-[11px] text-slate-400">helpdesk@bis.gov.in</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px]">Prototype data simulated for hackathon demo</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 BISMITRA AI — SIH Prototype for Indian Standards & BIS Services Automation.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Modular Frontend Architecture</span>
            <span>•</span>
            <span>RAG/AI Integration Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
