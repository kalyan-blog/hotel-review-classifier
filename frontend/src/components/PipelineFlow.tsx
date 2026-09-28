import React from 'react';
import { 
  FileText, 
  Binary, 
  Scissors, 
  Sparkles, 
  Cpu, 
  CheckCircle,
  ArrowRight,
  Info
} from 'lucide-react';

export const PipelineFlow: React.FC = () => {
  const steps = [
    { title: 'Hotel Review', desc: 'Raw customer text input', icon: FileText },
    { title: 'Text Preprocessing', desc: 'Lowercasing & punctuation removal', icon: Scissors },
    { title: 'Tokenization', desc: 'Word boundary splitting', icon: Binary },
    { title: 'Feature Extraction', desc: 'Sentiment lexicon & n-grams', icon: Sparkles },
    { title: 'Classification Model', desc: 'Scoring & probability weights', icon: Cpu },
    { title: 'Sentiment Prediction', desc: 'Positive / Negative + Confidence', icon: CheckCircle },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Machine Learning Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end NLP & sentiment classification workflow.
          </p>
        </div>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 self-start sm:self-center">
          NLP + Machine Learning
        </span>
      </div>

      {/* Horizontal Flow Steps */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;
          return (
            <div
              key={step.title}
              className="relative p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between hover:border-blue-200 transition-colors"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center mb-2.5">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 leading-tight">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {step.desc}
                </p>
              </div>

              {!isLast && (
                <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const HowItWorksCard: React.FC = () => {
  const steps = [
    'Enter a hotel review or pick a quick example.',
    'Text is cleaned and preprocessed for punctuation and casing.',
    'Sentiment features and keyword valence are analyzed.',
    'The model predicts Positive or Negative classification.',
    'Confidence score and explanation are displayed in real time.',
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">How It Works</h3>
          <p className="text-xs text-slate-500">Simple 5-step classification procedure</p>
        </div>
      </div>

      <ol className="space-y-2.5 text-xs text-slate-600">
        {steps.map((text, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="leading-relaxed">{text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
