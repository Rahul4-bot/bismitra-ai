import React from 'react';
import { 
  Layers, 
  FileCheck2, 
  Gem, 
  FlaskConical, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import Badge from '../common/Badge';

export default function QuickActionGrid({ onNavigate }) {
  const actions = [
    {
      id: 'find-standard',
      title: 'Find My Standard',
      badge: 'Product AI Match',
      badgeVariant: 'primary',
      description: 'Enter your product name or category to identify applicable Indian Standards (IS), mandatory QCOs, and testing scopes.',
      icon: Layers,
      color: 'text-blue-600',
      bg: 'bg-blue-50 text-blue-700',
      hoverBorder: 'hover:border-blue-300',
      btnText: 'Search Standards'
    },
    {
      id: 'certification',
      title: 'Certification Guide',
      badge: '7-Step Roadmap',
      badgeVariant: 'warning',
      description: 'Interactive compliance timeline covering application preparation, sample testing, factory inspection, and license grant.',
      icon: FileCheck2,
      color: 'text-amber-600',
      bg: 'bg-amber-50 text-amber-800',
      hoverBorder: 'hover:border-amber-300',
      btnText: 'View Roadmap'
    },
    {
      id: 'hallmarking',
      title: 'Hallmarking Help',
      badge: 'Gold / Silver HUID',
      badgeVariant: 'gold',
      description: 'Understand hallmarking rules, gold purity fineness (22K916), and test 6-digit HUID consumer verification.',
      icon: Gem,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 text-yellow-800',
      hoverBorder: 'hover:border-yellow-300',
      btnText: 'Hallmarking Portal'
    },
    {
      id: 'labs',
      title: 'Testing Labs',
      badge: 'NABL / BIS Central',
      badgeVariant: 'voluntary',
      description: 'Locate accredited laboratories by state and testing sector for electrical, food, chemical, or mechanical products.',
      icon: FlaskConical,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 text-emerald-800',
      hoverBorder: 'hover:border-emerald-300',
      btnText: 'Find Laboratories'
    },
    {
      id: 'consumer',
      title: 'Consumer Help',
      badge: 'Grievance & ISI Check',
      badgeVariant: 'source',
      description: 'Verify ISI mark CM/L numbers, identify counterfeit marks, and lodge consumer complaints against substandard products.',
      icon: HelpCircle,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 text-indigo-800',
      hoverBorder: 'hover:border-indigo-300',
      btnText: 'Consumer Portal'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
              Quick Action Services
            </h2>
            <Badge variant="gov" size="sm">
              Phase 1 Prototype
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Click any service card to navigate directly to its dedicated interactive workflow.
          </p>
        </div>
      </div>

      {/* 5-Card Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className={`group bg-white border border-slate-200/90 rounded-2xl p-5 shadow-gov-sm transition-all duration-200 cursor-pointer flex flex-col justify-between ${action.hoverBorder} hover:shadow-gov-md hover:-translate-y-0.5`}
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl ${action.bg} flex items-center justify-center shadow-xs transition-transform group-hover:scale-105`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant={action.badgeVariant} size="sm">
                    {action.badge}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 font-['Outfit',sans-serif] group-hover:text-gov-blue transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {action.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gov-blue group-hover:text-blue-800">
                <span>{action.btnText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
