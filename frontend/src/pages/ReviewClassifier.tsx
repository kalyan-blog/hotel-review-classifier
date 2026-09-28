import React, { useState } from 'react';
import { 
  Send, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  HelpCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  QUICK_EXAMPLES, 
  type ReviewItem 
} from '../data/reviewData';
import { classifyReview, type ClassifiedReview } from '../services/api';

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

  const handleSetExample = (key: 'positive' | 'negative' | 'neutral') => {
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
          <p className="mt-4 text-xs sm:text-sm text-slate-700 bg-white/80 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
            <strong className="text-slate-900">Analysis Explanation: </strong>
            {isPositive
              ? 'Positive sentiment detected based on the overall wording of the review.'
              : 'Negative sentiment detected based on critical and unfavorable feedback terms in the review.'}
          </p>

          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Model: <strong>TF-IDF + Logistic Regression</strong></span>
            <span>Recorded to Database: <strong>Saved (ID #{result.id})</strong></span>
          </div>

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
