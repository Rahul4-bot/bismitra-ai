import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RotateCcw, ShieldCheck, ArrowUpRight, MessageSquare } from 'lucide-react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import ExamplePromptPills from './ExamplePromptPills';
import { sendChatMessage } from '../../services/chatService';

export default function ChatContainer({ onNavigate }) {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### Namaste & Welcome to BISMITRA AI! 🙏\n\nI am your intelligent assistant for **Indian Standards (IS)** and **Bureau of Indian Standards (BIS)** services.\n\n**I can assist you with:**\n- Finding the exact **Indian Standard (IS code)** for your product.\n- Navigating the **7-step BIS Certification Process (ISI Mark)**.\n- Understanding **Gold & Silver Hallmarking** and verifying **6-digit HUID** codes.\n- Finding **BIS Central & NABL-Recognized Testing Laboratories**.\n- Consumer product quality verification and reporting fake standards.\n\n*Ask any question below or click one of the suggested prompts to get started.*`,
      sources: [
        {
          title: "Bureau of Indian Standards Act, 2016",
          sourceType: "Statutory Law of India",
          clause: "Section 10 (Conformity Assessment & Standardization)",
          status: "Official Statutory Source"
        },
        {
          title: "National Standards Body of India Overview",
          sourceType: "BIS Portal Knowledgebase",
          clause: "Technical Committee & Quality Framework",
          status: "Verified Reference"
        }
      ],
      suggestedActions: [
        { label: 'Which BIS standard applies to my product?', payloadText: 'Which BIS standard applies to my product?' },
        { label: 'How do I get BIS certification?', payloadText: 'How do I get BIS certification?' },
        { label: 'What is the hallmarking process?', payloadText: 'What is the hallmarking process?' },
        { label: 'Where can I find a testing laboratory?', payloadText: 'Where can I find a testing laboratory?' }
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const botResponse = await sendChatMessage(query);
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Failed to get response', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bismitra',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `### Conversation Cleared\n\nHow can I help you with Indian Standards or BIS services today? Type your query below.`,
        sources: [],
        suggestedActions: [
          { label: 'Standard for Electric Iron', payloadText: 'Which standard applies to electric iron?' },
          { label: 'Standard for Packaged Drinking Water', payloadText: 'Standard for packaged drinking water' }
        ]
      }
    ]);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-gov-md overflow-hidden flex flex-col min-h-[580px]">
      
      {/* Chat Header Bar */}
      <div className="bg-gradient-to-r from-gov-navy to-gov-navyLight px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <ShieldCheck className="w-5 h-5 text-gov-saffron" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base font-['Outfit',sans-serif]">
                BISMITRA AI Interactive Assistant
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Demo
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Grounded in Gazette Quality Control Orders & Indian Standard Specifications
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          title="Reset conversation"
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/15 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[520px] bg-slate-50/40">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onNavigate={onNavigate}
            onSendPrompt={(prompt) => handleSendMessage(prompt)}
          />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input & Prompt Area */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-4">
        
        {/* Example Prompt Chips */}
        <ExamplePromptPills
          onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          disabled={isLoading}
        />

        {/* Input Field with Send Button */}
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask about any product, IS standard, certification scheme, lab testing, or hallmarking..."
            className="w-full pl-4 pr-28 sm:pr-32 py-3.5 text-sm bg-slate-50 hover:bg-slate-50/80 focus:bg-white text-slate-900 border border-slate-300 focus:border-gov-blue focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all placeholder:text-slate-400 disabled:opacity-50"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isLoading}
              className="inline-flex items-center gap-1.5 bg-gov-navy hover:bg-blue-900 text-white disabled:bg-slate-200 disabled:text-slate-400 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Thinking...' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Press <strong>Enter</strong> to send • Prototype response mode</span>
          <span className="hidden sm:inline text-slate-400">All recommendations backed by mock IS clauses</span>
        </div>

      </div>

    </div>
  );
}
