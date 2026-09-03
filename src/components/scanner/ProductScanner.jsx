import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Keyboard, ScanLine } from 'lucide-react';
import Badge from '../common/Badge';

const DEMO_HINTS = [
  { label: 'Demo cooker QR value', value: 'DEMO-PC-48291' },
  { label: 'Real BIS product id', value: 'prod_001_electric_iron' },
  { label: 'Real IS number', value: 'IS 4151: 2015' },
  { label: 'Multiple demo records', value: 'DEMO-MULTI' },
  { label: 'Expired demo licence', value: 'DEMO-EXPIRED-LED' }
];

export default function ProductScanner({ onDetect, disabled = false }) {
  const [mode, setMode] = useState('manual');
  const [manualValue, setManualValue] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const scannerRef = useRef(null);
  const runningRef = useRef(false);
  const onDetectRef = useRef(onDetect);
  const readerId = 'bismitra-qr-reader';

  onDetectRef.current = onDetect;

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    runningRef.current = false;
    setCameraReady(false);
    if (!scanner) return;
    try {
      await scanner.stop();
    } catch {
      /* already stopped */
    }
  };

  useEffect(() => {
    if (mode !== 'camera') return undefined;
    let cancelled = false;

    const start = async () => {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
        if (cancelled) return;
        const scanner = new Html5Qrcode(readerId, { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 8,
            qrbox: { width: 220, height: 220 },
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.UPC_A
            ]
          },
          async (decodedText) => {
            if (!decodedText || disabled) return;
            await stopScanner();
            setMode('manual');
            setManualValue(decodedText);
            onDetectRef.current(decodedText);
          },
          () => {}
        );
        if (cancelled) {
          await stopScanner();
          return;
        }
        runningRef.current = true;
        setCameraReady(true);
      } catch (err) {
        runningRef.current = false;
        const denied = /NotAllowedError|Permission|denied/i.test(String(err?.name || err?.message || err));
        setCameraError(
          denied
            ? 'Camera scanning unavailable. Permission was denied. Enter a product identifier manually.'
            : 'Camera scanning unavailable. Enter a product identifier manually.'
        );
        setMode('manual');
      }
    };

    start();
    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [mode, disabled]);

  const startCamera = () => {
    setCameraError('');
    setMode('camera');
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const value = manualValue.trim();
    if (!value || disabled) return;
    onDetect(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={startCamera}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gov-navy hover:bg-blue-900 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          <Camera className="w-4 h-4 text-gov-saffron" />
          Scan Product
        </button>
        <button
          type="button"
          onClick={async () => {
            await stopScanner();
            setMode('manual');
          }}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-200"
        >
          <Keyboard className="w-4 h-4" />
          Enter Product ID manually
        </button>
      </div>

      {mode === 'camera' && (
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
          <div id={readerId} className="w-full min-h-[240px]" />
          <div className="px-3 py-2 text-[11px] text-slate-300 flex items-center gap-2">
            <ScanLine className="w-3.5 h-3.5 text-gov-saffron" />
            {cameraReady ? 'Point the camera at a QR or barcode.' : 'Requesting camera permission…'}
          </div>
        </div>
      )}

      {cameraError && (
        <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <CameraOff className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{cameraError}</span>
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="space-y-2">
        <label htmlFor="product-identifier" className="text-xs font-semibold text-slate-700">
          QR value, barcode, product ID, licence number, batch, or serial
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="product-identifier"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            disabled={disabled}
            maxLength={512}
            placeholder="e.g. prod_003_helmet or DEMO-PC-48291"
            className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-gov-blue focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={disabled || !manualValue.trim()}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-gov-blue hover:bg-blue-700 px-4 py-2.5 rounded-xl disabled:opacity-50"
          >
            Verify
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Try these identifiers</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_HINTS.map((hint) => (
            <button
              key={hint.value}
              type="button"
              disabled={disabled}
              onClick={() => {
                setManualValue(hint.value);
                onDetect(hint.value);
              }}
              className="inline-flex items-center gap-1.5 text-[11px] bg-white border border-slate-200 hover:border-blue-300 rounded-full px-2.5 py-1 text-slate-600"
            >
              {hint.label.startsWith('Demo') || hint.label.includes('demo') || hint.label.includes('Expired') || hint.label.includes('Multiple') ? (
                <Badge variant="warning" size="sm">
                  Demo
                </Badge>
              ) : (
                <Badge variant="primary" size="sm">
                  BIS data
                </Badge>
              )}
              {hint.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
