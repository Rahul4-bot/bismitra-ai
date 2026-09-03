import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, SearchX, Clock } from 'lucide-react';
import Badge from '../common/Badge';

const STATUS_UI = {
  VERIFIED: {
    variant: 'voluntary',
    icon: CheckCircle2,
    title: 'Product verified',
    checks: [
      'Product information matched',
      'Applicable BIS information found',
      'Certification/licence information found'
    ]
  },
  PARTIALLY_VERIFIED: {
    variant: 'warning',
    icon: AlertTriangle,
    title: 'Partially verified',
    checks: ['Partial information available']
  },
  EXPIRED: {
    variant: 'mandatory',
    icon: Clock,
    title: 'Certification/licence appears expired',
    checks: ['Certification/licence appears expired according to the available record.']
  },
  NOT_FOUND: {
    variant: 'default',
    icon: SearchX,
    title: 'Not found',
    checks: ['Product could not be verified using the available BIS data.']
  },
  UNKNOWN: {
    variant: 'source',
    icon: HelpCircle,
    title: 'Status unknown',
    checks: ['Status could not be determined from the available BIS data.']
  }
};

export default function VerificationStatus({ status, isDemo = false, missingFields = [] }) {
  const config = STATUS_UI[status] || STATUS_UI.UNKNOWN;
  const Icon = config.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={config.variant} size="sm">
          {status || 'UNKNOWN'}
        </Badge>
        {isDemo && (
          <Badge variant="warning" size="sm">
            Demo data
          </Badge>
        )}
      </div>
      <div className="flex items-start gap-2">
        <Icon className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">{config.title}</p>
          <ul className="mt-1 space-y-0.5">
            {config.checks.map((line) => (
              <li key={line} className="text-xs text-slate-600">
                {line}
              </li>
            ))}
          </ul>
          {status === 'PARTIALLY_VERIFIED' && missingFields.length > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              Missing from connected BIS data: {missingFields.join(', ')}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
