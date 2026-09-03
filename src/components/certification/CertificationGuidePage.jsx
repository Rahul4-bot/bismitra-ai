import React, { useState } from 'react';
import {
  FileCheck2,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  BookOpen,
  FlaskConical,
  MonitorPlay,
  ShieldCheck,
  FileText,
  Layers
} from 'lucide-react';
import Badge from '../common/Badge';
import SourceCard from '../common/SourceCard';

// Verified BIS knowledge data reused directly (imported by path)
import certDocs from '../../data/knowledge/documents/certification.json';
import testingDocs from '../../data/knowledge/documents/testing.json';

// Look up the verified certification roadmap and related documents
const sevenStepDoc = certDocs.find(d => d.id === 'doc_cert_003_seven_step_roadmap');
const manakonlineDoc = certDocs.find(d => d.id === 'doc_cert_002_application_steps');
const schemeOverviewDoc = certDocs.find(d => d.id === 'doc_cert_001_scheme1_overview');
const factoryAuditDoc = certDocs.find(d => d.id === 'doc_cert_004_factory_audit_and_testing');
const testingDocsList = testingDocs;

// The 7-step certification roadmap, grounded in the verified lifecycle document
const STEPS = [
  {
    num: 1,
    title: 'Understand Requirements',
    summary: 'Determine the applicable BIS standard, scheme and mandatory requirements for your product.',
    details: 'Verify the IS code and confirm whether the product falls under a notified Quality Control Order (QCO) with mandatory certification. Identify the applicable scheme and the requirements it imposes on the product.',
    needs: ['Identify applicable Indian Standard (IS code)', 'Confirm QCO / mandatory scope', 'Identify applicable certification scheme'],
    docs: ['Indian Standard specification (applicable IS)', 'QCO notification (if applicable)']
  },
  {
    num: 2,
    title: 'Prepare Documentation',
    summary: 'Prepare the application details, factory information and quality documentation before submission.',
    details: 'Collect manufacturing machinery details, test equipment list, quality control personnel credentials, factory layout and company profile needed for the Manakonline application.',
    needs: ['Company profile & factory details', 'Manufacturing machinery list', 'Test equipment list & QC personnel credentials'],
    docs: ['Company registration / profile documents', 'Factory layout & machinery details']
  },
  {
    num: 3,
    title: 'Product Testing',
    summary: 'Test the product against the standard in an in-house lab and via independent accredited testing.',
    details: 'Set up the in-house laboratory and perform the mandatory routine tests. During the process, product samples are independently tested at a BIS Central or recognized NABL laboratory to verify conformity to the standard.',
    needs: ['In-house laboratory with routine test apparatus', 'Qualified QC staff', 'Independent accredited lab testing of samples'],
    docs: ['Test Request Form (TRF)', 'Technical documentation (schematics, rating plate)', 'Standard sample quantity']
  },
  {
    num: 4,
    title: 'Submit Application',
    summary: 'Submit the certification application through the official Manakonline portal.',
    details: 'Register on Manakonline, create the company profile, select the applicable Indian Standard, submit the machinery/test facility details, and complete the application and preliminary inspection fee payment.',
    needs: ['Manakonline account & registration', 'Applicable standard selected', 'Fee payment & online submission'],
    docs: ['Manakonline application form', 'Fee payment receipt']
  },
  {
    num: 5,
    title: 'Factory Inspection / Audit',
    summary: 'A BIS technical officer audits the manufacturing premises and quality systems.',
    details: 'A BIS technical officer visits the manufacturing premises to audit production systems, test apparatus calibration and the overall quality management system. The auditor then draws and seals production samples for independent testing.',
    needs: ['Manufacturing facility ready for audit', 'Calibrated test apparatus', 'Production samples available for drawing'],
    docs: ['Factory audit report', 'Test equipment calibration records']
  },
  {
    num: 6,
    title: 'Technical Scrutiny / Sample Evaluation',
    summary: 'Inspection findings and laboratory test reports are scrutinized against the standard.',
    details: 'The factory inspection findings and the independent laboratory test reports are formally reviewed against the requirements of the standard to confirm full conformity before a licence decision is made.',
    needs: ['Factory inspection report', 'Accredited laboratory test report', 'Technical scrutiny of both'],
    docs: ['Laboratory test report', 'Technical scrutiny checklist']
  },
  {
    num: 7,
    title: 'Grant of Licence',
    summary: 'On successful scrutiny, the Certification Marks Licence (CM/L) is granted.',
    details: 'Once all requirements are satisfied, BIS issues the Certification Marks Licence with a unique 7 or 8-digit CM/L number, allowing the manufacturer to affix the ISI Mark on the product.',
    needs: ['Successful technical scrutiny', 'Compliance with all requirements'],
    docs: ['Certification Marks Licence (CM/L number)', 'ISI Mark usage authorization']
  }
];

// Simple status helper for the prototype roadmap.
// 0 = completed/identified, 1 = current/next, 2 = upcoming
function stepStatus(stepNum, hasContext) {
  if (!hasContext) return 2; // no product/standard context: all upcoming
  if (stepNum === 1) return 0; // standard identified
  if (stepNum === 2) return 1; // next step
  return 2; // upcoming
}

const STATUS_META = {
  0: { label: 'Completed / Identified', icon: CheckCircle2, cls: 'text-gov-green bg-emerald-50 border-emerald-200' },
  1: { label: 'Current / Next Step', icon: Circle, cls: 'text-gov-blue bg-blue-50 border-blue-200' },
  2: { label: 'Upcoming', icon: Circle, cls: 'text-slate-400 bg-slate-50 border-slate-200' }
};

function ContextField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function DocumentsYouMayNeed() {
  const items = [
    { title: 'Manakonline Application', desc: 'Digital application for a BIS licence covering registration, standard selection and submission.', doc: manakonlineDoc, fallback: 'Online application process handled through Manakonline.' },
    { title: 'Company & Factory Details', desc: 'Company profile, factory layout, machinery list and QC staff credentials required for submission.', doc: factoryAuditDoc, fallback: 'Factory and quality documentation required for the certification process.' },
    { title: 'Test Request Form (TRF)', desc: 'Details product name, model/type, applicant information and requested testing parameters.', doc: testingDocsList.find(d => d.id === 'doc_test_002_sample_submission'), fallback: 'Documentation required before laboratory sample testing.' },
    { title: 'Technical Documentation', desc: 'Circuit schematics, rating plate artwork, component list and material data where applicable.', doc: testingDocsList.find(d => d.id === 'doc_test_002_sample_submission'), fallback: 'Technical documentation for the product.' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.title} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100/70 text-blue-700 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-slate-900">{item.title}</p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
          {(item.doc?.document_title || item.doc?.url) && (
            <p className="text-[10px] text-slate-400">
              {item.doc?.document_title}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CertificationGuidePage({ onNavigate, payload = null }) {
  const [openStep, setOpenStep] = useState(2); // open Step 2 "Prepare Documentation" as the active next step by default
  const [showAllSteps, setShowAllSteps] = useState(true);

  const product = payload?.product;
  const standard = payload?.standard;
  const category = payload?.category;

  const hasContext = Boolean(product || standard || category);

  const sourceDocs = [sevenStepDoc, manakonlineDoc, schemeOverviewDoc, factoryAuditDoc].filter(Boolean);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-gov-md space-y-8 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="sm">
              CERTIFICATION
            </Badge>
            <span className="text-xs text-slate-400">7-Step Compliance Roadmap</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            Get BIS Certified
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Follow the step-by-step certification journey for your product.
          </p>
          {product && (
            <p className="text-sm font-semibold text-gov-navy">
              Certification Journey for {product}
            </p>
          )}
          {standard && (
            <p className="text-xs font-semibold text-gov-blue">
              Applicable Standard: {standard}
            </p>
          )}
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-gov-navy bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          ← Return to Home & Chat
        </button>
      </div>

      {/* Context Card (only when payload exists) */}
      {hasContext && (
        <div className="bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-200/60 rounded-2xl p-4 sm:p-5 space-y-3 shadow-gov-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gov-blue" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Product & Standard</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ContextField label="Product" value={product} />
            <ContextField label="Standard" value={standard} />
            <ContextField label="Category" value={category} />
          </div>
        </div>
      )}

      {/* No payload state */}
      {!hasContext && (
        <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-300 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-gov-blue mx-auto flex items-center justify-center shadow-xs">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Certification Guide</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Start by identifying the BIS standard applicable to your product.
            </p>
          </div>
          <button
            onClick={() => onNavigate('find-standard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gov-navy hover:bg-blue-900 px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-gov-sm"
          >
            Find My Standard
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Your Next Step (only when context present) */}
      {hasContext && (
        <div className="bg-gov-navy text-white rounded-2xl p-5 sm:p-6 shadow-gov-md space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="gov" size="sm">Your Next Step</Badge>
          </div>
          <p className="text-sm sm:text-base font-semibold text-blue-100">
            Prepare the required documentation before starting the BIS application.
          </p>
          <p className="text-xs text-slate-300">
            Focus on Step 2 — Prepare Documentation — to keep your application moving smoothly.
          </p>
          <button
            onClick={() => { setOpenStep(2); setShowAllSteps(true); }}
            className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-gov-navy bg-white hover:bg-slate-100 px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            View Requirements
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 7-Step Roadmap */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">7-Step Certification Roadmap</h3>
            <p className="text-xs text-slate-500 max-w-2xl">
              Based on BIS reference information in BISMITRA's knowledge base.
            </p>
          </div>
          <button
            onClick={() => setShowAllSteps(v => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gov-blue hover:text-blue-800 transition-colors cursor-pointer"
          >
            {showAllSteps ? 'Show next step' : 'Show all steps'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showAllSteps ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STEPS.map((step) => {
            const status = getStepVisibility(step.num, hasContext, showAllSteps, openStep);
            if (!status.visible) return null;
            const sMeta = STATUS_META[stepStatus(step.num, hasContext)];
            const StatusIcon = sMeta.icon;
            const isOpen = openStep === step.num && status.expandable;
            return (
              <div
                key={step.num}
                className={`bg-slate-50 border rounded-2xl p-4 space-y-3 transition-all ${
                  stepStatus(step.num, hasContext) === 1 ? 'border-gov-blue ring-1 ring-gov-blue/20 shadow-gov-sm' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-sm shrink-0 ${
                      stepStatus(step.num, hasContext) === 1 ? 'bg-gov-navy text-white' : 'bg-blue-100 text-gov-blue'
                    }`}>
                      {String(step.num).padStart(2, '0')}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Step {step.num}</p>
                      <h4 className="font-bold text-sm text-slate-900 font-['Outfit',sans-serif]">{step.title}</h4>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 border whitespace-nowrap ${sMeta.cls}`}>
                    <StatusIcon className="w-3 h-3" />
                    {sMeta.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{step.summary}</p>

                {isOpen && (
                  <div className="bg-white/70 border border-slate-100 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed">{step.details}</p>
                    {step.needs && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">What you need</p>
                        <ul className="space-y-1">
                          {step.needs.map((n) => (
                            <li key={n} className="flex items-start gap-1.5 text-xs text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gov-green mt-0.5 shrink-0" />
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {step.docs && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Documents / Requirements</p>
                        <ul className="space-y-1">
                          {step.docs.map((d) => (
                            <li key={d} className="flex items-start gap-1.5 text-xs text-slate-700">
                              <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setOpenStep(isOpen ? null : step.num)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gov-blue hover:text-blue-800 transition-colors cursor-pointer"
                >
                  {isOpen ? 'Hide Details' : 'View Details'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Documents You May Need */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gov-blue" />
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Documents You May Need</h3>
        </div>
        <p className="text-xs text-slate-500 -mt-2 max-w-2xl">
          Based on the verified certification information in BISMITRA's knowledge base.
        </p>
        <DocumentsYouMayNeed />
      </section>

      {/* Testing & Inspection */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-gov-blue" />
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Testing & Inspection</h3>
        </div>
        {factoryAuditDoc && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-800">{factoryAuditDoc.title}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{factoryAuditDoc.content}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testingDocsList.map((doc) => (
            <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-bold text-slate-900">{doc.title}</p>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">{doc.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Manakonline */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MonitorPlay className="w-4 h-4 text-gov-blue" />
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Apply Through Manakonline</h3>
        </div>
        {manakonlineDoc && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-800">{manakonlineDoc.title}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{manakonlineDoc.content}</p>
            {manakonlineDoc.url && (
              <a
                href={manakonlineDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gov-navy hover:bg-blue-900 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-gov-sm"
              >
                Open Manakonline
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </section>

      {/* Information Sources */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">Information Sources</h3>
        </div>
        <p className="text-xs text-slate-500 -mt-2">
          Based on BIS reference information in BISMITRA's knowledge base.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sourceDocs.map((doc) => (
            <SourceCard
              key={doc.id}
              title={doc.title}
              sourceType={doc.source_name}
              reference={doc.section}
              status="Verified BIS reference"
              url={doc.url}
              linkText="View Source"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function getStepVisibility(stepNum, hasContext, showAllSteps, openStep) {
  const isNext = stepNum === 2;
  const isOpen = openStep === stepNum;
  const visible = showAllSteps || isNext || isOpen;
  return { visible, expandable: true };
}
