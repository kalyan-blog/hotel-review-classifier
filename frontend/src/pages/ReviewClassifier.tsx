import React, { useState } from 'react';
import { 
  Send, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  HelpCircle,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  Lightbulb,
  Layers
} from 'lucide-react';
import { 
  QUICK_EXAMPLES, 
  type ReviewItem 
} from '../data/reviewData';
import { classifyReview, type ClassifiedReview, type AspectItem } from '../services/api';

interface ReviewClassifierProps {
  onAddRecentReview: (item: ReviewItem) => void;
  onRefreshStats?: () => void;
}

export const ReviewClassifier: React.FC<ReviewClassifierProps> = ({ 
  onAddRecentReview,
  onRefreshStats 
}) => {
  const [reviewText, setReviewText] = useState<string>('');
  const [result, setResult] = useState<ClassifiedReview | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const handleSetExample = (key: 'positive' | 'negative' | 'neutral' | 'mixed') => {
    setActiveExample(key);
    const text = QUICK_EXAMPLES[key];
    setReviewText(text);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    const cleanText = reviewText.trim();
    if (!cleanText) {
      setErrorMessage('Please enter review text before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // Send REST API request to FastAPI backend
      const data = await classifyReview(cleanText);
      setResult(data);

      // Add to recent reviews list
      onAddRecentReview({
        id: data.id,
        review: data.review,
        sentiment: data.sentiment,
        confidence: data.confidence,
        date: 'Just now',
      });

      // Refresh dashboard stats if requested
      if (onRefreshStats) {
        onRefreshStats();
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Unable to connect to the classification server. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setReviewText('');
    setResult(null);
    setErrorMessage(null);
    setActiveExample(null);
  };

  const isPositive = result?.sentiment === 'Positive';
  const wordCount = reviewText.trim() ? reviewText.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Classify a Hotel Review
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Enter a customer review to predict its sentiment using NLP classification.
        </p>
      </div>

      {/* Main Classifier Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-7 shadow-card space-y-5">
        
        {/* Text Area Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label htmlFor="review-textarea" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            Customer Review Text
          </label>
          <span className="text-xs text-slate-400 font-mono">
            {wordCount} words &bull; {reviewText.length} chars
          </span>
        </div>

        {/* Textarea */}
        <textarea
          id="review-textarea"
          rows={5}
          value={reviewText}
          onChange={(e) => {
            setReviewText(e.target.value);
            setActiveExample(null);
            setErrorMessage(null);
          }}
          placeholder="Example: The room was clean, spacious and the staff were extremely friendly..."
          className="w-full rounded-xl border border-slate-300 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-y"
        />

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Test Reviews Buttons */}
        <div>
          <span className="text-xs font-medium text-slate-500 block mb-2">
            Quick Test Examples:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSetExample('positive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeExample === 'positive'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Positive Example
            </button>
            <button
              type="button"
              onClick={() => handleSetExample('negative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeExample === 'negative'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Negative Example
            </button>
            <button
              type="button"
              onClick={() => handleSetExample('neutral')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeExample === 'neutral'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Neutral Example
            </button>
            <button
              type="button"
              onClick={() => handleSetExample('mixed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeExample === 'mixed'
                  ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-sm font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Mixed Example (Aspect Demo)
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={!reviewText && !result}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Text
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!reviewText.trim() || isAnalyzing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-500/30 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Analyzing Review...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analyze Review</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Sentiment Result Card (Section 7) */}
      {result && (
        <div
          className={`rounded-xl border p-6 shadow-card transition-all duration-300 ${
            isPositive
              ? 'bg-emerald-50/40 border-emerald-200'
              : 'bg-rose-50/40 border-rose-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {isPositive ? (
                  <ThumbsUp className="w-6 h-6" />
                ) : (
                  <ThumbsDown className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Sentiment Result
                </span>
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-xl sm:text-2xl font-bold ${
                      isPositive ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {result.sentiment}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      isPositive
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}
                  >
                    {result.confidence.toFixed(1)}% Confidence
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-500 block">Classification ID</span>
              <span className="text-sm font-bold font-mono text-slate-700">
                #{result.id} &bull; {wordCount} words
              </span>
            </div>
          </div>

          {/* Confidence Progress Bar */}
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-medium text-slate-600">
              <span>Confidence Score</span>
              <span className="font-mono font-bold">{result.confidence.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isPositive ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>

          {/* Explanation Text */}
          <div className="mt-4 text-xs sm:text-sm text-slate-700 bg-white/80 p-3.5 rounded-lg border border-slate-200/80 leading-relaxed space-y-1">
            <span className="font-bold text-slate-900 block">Analysis Explanation:</span>
            <p className="text-slate-800">
              {result.summary || (isPositive
                ? 'Positive sentiment detected based on the overall wording of the review.'
                : 'Negative sentiment detected based on critical and unfavorable feedback terms in the review.')}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Model: <strong>TF-IDF + Logistic Regression</strong></span>
            <span>Recorded to Database: <strong>Saved (ID #{result.id})</strong></span>
          </div>

        </div>
      )}

      {/* Detailed Feedback Analysis Section */}
      {result && result.aspects && result.aspects.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-7 shadow-card space-y-6 animate-fadeIn">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Detailed Feedback Analysis
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Aspect-level sentiment breakdown and customer evidence extracted from the review.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                {result.aspects.filter((a: AspectItem) => a.sentiment === 'Positive').length} Positive
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                {result.aspects.filter((a: AspectItem) => a.sentiment === 'Negative').length} Negative
              </span>
              {result.aspects.filter((a: AspectItem) => a.sentiment === 'Neutral').length > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  {result.aspects.filter((a: AspectItem) => a.sentiment === 'Neutral').length} Neutral
                </span>
              )}
            </div>
          </div>

          {/* 1. Overall Summary */}
          {result.summary && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Overall Summary</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {result.summary}
              </p>
            </div>
          )}

          {/* 2 & 3. Positive & Negative Aspects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Positive Aspects */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 sm:p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-emerald-900">Positive Aspects</h4>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {result.aspects.filter((a: AspectItem) => a.sentiment === 'Positive').length}
                  </span>
                </div>

                {/* Aspect Cards with Evidence */}
                <div className="space-y-2.5">
                  {result.aspects.filter((a: AspectItem) => a.sentiment === 'Positive').length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">No specific positive aspects identified.</p>
                  ) : (
                    result.aspects
                      .filter((a: AspectItem) => a.sentiment === 'Positive')
                      .map((item: AspectItem, idx: number) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-emerald-100 shadow-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{item.aspect}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                              Positive
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 flex items-start gap-1.5">
                            <span className="font-semibold text-slate-500 shrink-0">Evidence:</span>
                            <span className="italic text-slate-700 font-serif">"{item.evidence}"</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Positive Feedback Bullets */}
              {result.positive_feedback && result.positive_feedback.length > 0 && (
                <div className="pt-3 border-t border-emerald-200/60 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                    Positive Feedback:
                  </span>
                  <ul className="space-y-1 text-xs text-emerald-950">
                    {result.positive_feedback.map((fb: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold leading-none shrink-0">✓</span>
                        <span className="leading-snug">{fb}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Negative Aspects */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/20 p-4 sm:p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <h4 className="text-sm font-bold text-rose-900">Negative Aspects</h4>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {result.aspects.filter((a: AspectItem) => a.sentiment === 'Negative').length}
                  </span>
                </div>

                {/* Aspect Cards with Evidence */}
                <div className="space-y-2.5">
                  {result.aspects.filter((a: AspectItem) => a.sentiment === 'Negative').length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">No specific negative aspects identified.</p>
                  ) : (
                    result.aspects
                      .filter((a: AspectItem) => a.sentiment === 'Negative')
                      .map((item: AspectItem, idx: number) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-rose-100 shadow-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{item.aspect}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold border border-rose-200">
                              Negative
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 flex items-start gap-1.5">
                            <span className="font-semibold text-slate-500 shrink-0">Evidence:</span>
                            <span className="italic text-slate-700 font-serif">"{item.evidence}"</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Negative Feedback Bullets */}
              {result.negative_feedback && result.negative_feedback.length > 0 && (
                <div className="pt-3 border-t border-rose-200/60 space-y-1.5">
                  <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block">
                    Negative Feedback:
                  </span>
                  <ul className="space-y-1 text-xs text-rose-950">
                    {result.negative_feedback.map((fb: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold leading-none shrink-0">✗</span>
                        <span className="leading-snug">{fb}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 4. Neutral Aspects (Only when applicable) */}
          {result.aspects.some((a: AspectItem) => a.sentiment === 'Neutral') && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-900">Neutral Aspects</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.aspects
                  .filter((a: AspectItem) => a.sentiment === 'Neutral')
                  .map((item: AspectItem, idx: number) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.aspect}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          Neutral
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="font-semibold text-slate-500 shrink-0">Evidence:</span>
                        <span className="italic text-slate-700 font-serif">"{item.evidence}"</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 5. Hotel Management Insight */}
          {result.management_insight && (
            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Hotel Management Insight</h4>
                  <span className="text-[11px] text-slate-500 block">Actionable takeaways based on customer-stated aspects</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pl-9">
                {result.management_insight}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Educational Note */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          <strong>Notice: </strong>
          This model classifies general hotel and hospitality sentiment. It is designed for educational demonstrations and does not assess medical, legal, or sensitive customer information.
        </p>
      </div>

    </div>
  );
};
