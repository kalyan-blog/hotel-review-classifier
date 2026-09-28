import React from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Award, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import type { ReviewItem } from '../data/reviewData';
import type { DashboardStats, SentimentDistribution } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { SentimentChart } from '../components/SentimentChart';
import { RecentReviewsTable } from '../components/RecentReviewsTable';
import { PipelineFlow, HowItWorksCard } from '../components/PipelineFlow';

interface DashboardProps {
  stats: DashboardStats | null;
  sentimentDist: SentimentDistribution | null;
  recentReviews: ReviewItem[];
  isLoading?: boolean;
  error?: string | null;
  onNavigateToClassifier: () => void;
  onRefresh?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats,
  sentimentDist,
  recentReviews, 
  isLoading = false,
  error = null,
  onNavigateToClassifier,
  onRefresh,
}) => {
  const totalReviews = stats?.total_reviews ?? 1000;
  const positiveReviews = stats?.positive_reviews ?? 720;
  const negativeReviews = stats?.negative_reviews ?? 280;
  const modelAccuracy = stats?.model_accuracy ? `${stats.model_accuracy}%` : '91.5%';

  const posPct = totalReviews > 0 ? ((positiveReviews / totalReviews) * 100).toFixed(1) : '72.0';
  const negPct = totalReviews > 0 ? ((negativeReviews / totalReviews) * 100).toFixed(1) : '28.0';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hotel Review Classification Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyze customer feedback and classify hotel reviews using Natural Language Processing.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh statistics from server"
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}
          <button
            onClick={onNavigateToClassifier}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Classify a Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Network Alert (if backend is temporarily unreachable) */}
      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="underline font-semibold hover:text-amber-900"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Reviews"
          value={totalReviews.toLocaleString()}
          subtitle="Processed hotel corpus"
          icon={MessageSquare}
          variant="slate"
        />
        <MetricCard
          title="Positive Reviews"
          value={positiveReviews.toLocaleString()}
          subtitle={`${posPct}% favorable feedback`}
          icon={ThumbsUp}
          variant="green"
        />
        <MetricCard
          title="Negative Reviews"
          value={negativeReviews.toLocaleString()}
          subtitle={`${negPct}% critical feedback`}
          icon={ThumbsDown}
          variant="red"
        />
        <MetricCard
          title="Model Accuracy"
          value={modelAccuracy}
          subtitle="Test set evaluation score"
          icon={Award}
          variant="blue"
        />
      </div>

      {/* Sentiment Overview & How It Works Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex">
          <div className="w-full">
            <SentimentChart
              positive={sentimentDist?.positive ?? positiveReviews}
              negative={sentimentDist?.negative ?? negativeReviews}
            />
          </div>
        </div>
        <div className="lg:col-span-5 flex">
          <div className="w-full">
            <HowItWorksCard />
          </div>
        </div>
      </div>

      {/* Recent Review Classifications Table */}
      <RecentReviewsTable reviews={recentReviews} />

      {/* Machine Learning Pipeline Diagram */}
      <PipelineFlow />
    </div>
  );
};
