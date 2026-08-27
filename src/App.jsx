import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HeroBanner from './components/home/HeroBanner';
import QuickActionGrid from './components/home/QuickActionGrid';
import ChatContainer from './components/chat/ChatContainer';
import Badge from './components/common/Badge';
import { Layers, FileCheck2, Gem, FlaskConical, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [navigationPayload, setNavigationPayload] = useState(null);

  const handleNavigate = (targetTab, payload = null) => {
    setActiveTab(targetTab);
    setNavigationPayload(payload);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* HOME VIEW: Hero + Chat Assistant + Quick Action Cards */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Hero Banner with Branding & Stats */}
            <HeroBanner />

            {/* Central Interactive AI Assistant Chat Area */}
            <section id="chat-section" className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                    Ask BISMITRA AI Assistant
                  </h2>
                  <p className="text-xs text-slate-500">
                    Type a question or select an example prompt to receive source-backed recommendations.
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  Interactive RAG Sim
                </Badge>
              </div>

              <ChatContainer onNavigate={handleNavigate} />
            </section>

            {/* 5 Quick Action Service Cards */}
            <section className="pt-2">
              <QuickActionGrid onNavigate={handleNavigate} />
            </section>
          </div>
        )}

        {/* PLACEHOLDER / SHELL VIEWS FOR STEPS 4 & 5 */}
        {activeTab !== 'home' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-gov-md space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {activeTab.toUpperCase().replace('-', ' ')}
                  </Badge>
                  <span className="text-xs text-slate-400">Step 4 & 5 Upcoming Feature</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif] capitalize">
                  {activeTab.replace('-', ' ')}
                </h2>
                {navigationPayload?.product && (
                  <p className="text-xs font-semibold text-gov-blue">
                    Passed Context: {navigationPayload.product}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleNavigate('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-gov-navy bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>← Return to Home & Chat</span>
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-gov-blue mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Ready for Step 4 & 5 Implementation
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The navigation route and context payload from the chat assistant were successfully received. This view will be built with dedicated search filters, simulators, and interactive roadmaps in the next steps.
                </p>
              </div>
              <button
                onClick={() => handleNavigate('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gov-navy hover:bg-blue-900 px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                <span>Try Chat Assistant on Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Portal Footer */}
      <Footer setActiveTab={handleNavigate} />
    </div>
  );
}
