import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Menu, 
  X, 
  Sparkles, 
  Layers, 
  FileCheck2, 
  Gem, 
  FlaskConical, 
  HelpCircle,
  Home,
  ScanLine
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan-product', label: 'Scan Product', icon: ScanLine },
    { id: 'find-standard', label: 'Find My Standard', icon: Layers },
    { id: 'certification', label: 'Certification Guide', icon: FileCheck2 },
    { id: 'hallmarking', label: 'Hallmarking Help', icon: Gem },
    { id: 'labs', label: 'Testing Labs', icon: FlaskConical },
    { id: 'consumer', label: 'Consumer Help', icon: HelpCircle },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Tricolor Government Top Line */}
      <div className="gov-tricolor-bar w-full" />

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand & Emblem */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            {/* BIS Logo / Shield Badge */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-gov-navy to-gov-navyLight flex items-center justify-center text-white shadow-md shadow-gov-navy/20 border border-slate-700/50 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6 text-gov-saffron" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-gov-navy font-['Outfit',sans-serif]">
                  BISMITRA <span className="text-gov-blue">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-gov-blueLight text-gov-blue px-2 py-0.5 rounded-full border border-blue-200">
                  <Sparkles className="w-2.5 h-2.5 text-gov-saffron" />
                  SIH Prototype
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight hidden sm:block">
                Bureau of Indian Standards • Intelligent Assistant
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gov-navy text-white shadow-sm'
                      : 'text-slate-600 hover:text-gov-navy hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gov-saffron' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action / System Status */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
              <span className="font-medium text-[11px]">System: <strong className="text-slate-800">Online</strong></span>
            </div>

            <button
              onClick={() => handleNavClick('find-standard')}
              className="inline-flex items-center gap-1.5 bg-gov-blue hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup Standard</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation Menu</span>
            <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">Phase 1 Demo</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gov-navy text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-gov-saffron' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
