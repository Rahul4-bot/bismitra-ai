import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Badge from '../common/Badge';
import ProductScanner from './ProductScanner';
import ProductJourneyView from './ProductJourneyView';
import { verifyProductIdentifier } from '../../services/productVerification';

const STEPS = [
  'Reading product...',
  'Identifying product...',
  'Checking BIS information...',
  'Building product journey...'
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ScanProductPage({ onNavigate }) {
  const [phase, setPhase] = useState('input');
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [pendingValue, setPendingValue] = useState('');

  const runLookup = async (scanValue, selectedRecordId = null) => {
    setError('');
    setPendingValue(scanValue);
    setPhase('loading');
    setStepIndex(0);

    for (let i = 0; i < STEPS.length; i += 1) {
      setStepIndex(i);
      await sleep(180);
    }

    const data = await verifyProductIdentifier(scanValue, selectedRecordId);

    if (!data.ok && data.errorCode === 'network') {
      setError(data.message);
      setPhase('input');
      return;
    }

    if (data.multiple) {
      setResult(data);
      setPhase('multiple');
      return;
    }

    setResult(data);
    setPhase('result');
  };

  const reset = () => {
    setPhase('input');
    setResult(null);
    setError('');
    setPendingValue('');
    setStepIndex(0);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-gov-md space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              SCAN PRODUCT
            </Badge>
            <span className="text-xs text-slate-400">Product Journey Scanner</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            Product Journey
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Scan a QR/barcode or enter an identifier. BISMITRA matches it against connected BIS data, then builds only the journey stages that those records actually support.
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-gov-navy bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 self-start sm:self-auto"
        >
          ← Return to Home & Chat
        </button>
      </div>

      {phase === 'input' && (
        <div className="space-y-4">
          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}
          <ProductScanner onDetect={(value) => runLookup(value)} />
        </div>
      )}

      {phase === 'loading' && (
        <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-gov-blue mx-auto animate-spin" />
          <p className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">{STEPS[stepIndex]}</p>
          <p className="text-xs text-slate-500">Matching against connected BIS records only.</p>
        </div>
      )}

      {phase === 'multiple' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Multiple records found</h3>
            <p className="text-xs text-slate-500 mt-1">
              This identifier matched more than one record. Choose the correct product. BISMITRA will not pick one at random.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(result?.candidates || []).map((candidate) => (
              <button
                key={`${candidate.dataSource}-${candidate.id}`}
                type="button"
                onClick={() => runLookup(pendingValue, candidate.id)}
                className="text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl p-4 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={candidate.dataSource === 'demo' ? 'warning' : 'primary'} size="sm">
                    {candidate.dataSource === 'demo' ? 'Demo data' : 'BIS data'}
                  </Badge>
                </div>
                <p className="text-sm font-bold text-slate-900">{candidate.productName}</p>
                <p className="text-xs text-slate-500">Manufacturer: {candidate.manufacturer}</p>
                <p className="text-xs text-slate-500">Licence: {candidate.licenceNumber}</p>
                <p className="text-xs text-slate-500">Category: {candidate.category}</p>
                <p className="text-xs text-slate-500">Standard: {candidate.standard}</p>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs font-semibold text-slate-600 hover:text-gov-navy"
          >
            ← Enter a different identifier
          </button>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Product journey ready</p>
          <ProductJourneyView result={result} onReset={reset} />
        </div>
      )}
    </div>
  );
}
