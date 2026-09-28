import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Database, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  Star, 
  Sparkles,
  Tag,
  Info
} from 'lucide-react';
import { 
  INITIAL_FALLBACK_STATS, 
  RATING_DISTRIBUTION, 
  TOP_KEYWORDS 
} from '../data/reviewData';
import { MetricCard } from '../components/MetricCard';
import type { DashboardStats, RatingDistribution } from '../services/api';
import { getRatingDistribution } from '../services/api';

interface DatasetInsightsProps {
  stats?: DashboardStats | null;
}

export const DatasetInsights: React.FC<DatasetInsightsProps> = ({ stats }) => {
  const [ratingMeta, setRatingMeta] = useState<RatingDistribution | null>(null);

  useEffect(() => {
    getRatingDistribution()
      .then((data) => setRatingMeta(data))
      .catch(() => {});
  }, []);

  const totalReviews = stats?.total_reviews ?? INITIAL_FALLBACK_STATS.totalReviews;
  const positiveReviews = stats?.positive_reviews ?? INITIAL_FALLBACK_STATS.positiveReviews;
  const negativeReviews = stats?.negative_reviews ?? INITIAL_FALLBACK_STATS.negativeReviews;
  const total = positiveReviews + negativeReviews;
  const posPct = total > 0 ? Math.round((positiveReviews / total) * 100) : 72;
  const negPct = total > 0 ? 100 - posPct : 28;

  const binaryComparisonData = [
    { label: 'Positive', count: positiveReviews, color: '#16A34A' },
    { label: 'Negative', count: negativeReviews, color: '#DC2626' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hotel Review Dataset
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Empirical corpus distribution, rating frequencies, and lexical sentiment characteristics.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
          <Database className="w-3.5 h-3.5" />
          {totalReviews.toLocaleString()} Annotated Reviews
        </span>
      </div>

      {/* 4 Dataset Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Reviews"
          value={totalReviews.toLocaleString()}
          subtitle="Curated dataset size"
          icon={Database}
          variant="slate"
        />
        <MetricCard
          title="Positive Reviews"
          value={positiveReviews.toLocaleString()}
          subtitle="Favorable classifications"
          icon={ThumbsUp}
          variant="green"
        />
        <MetricCard
          title="Negative Reviews"
          value={negativeReviews.toLocaleString()}
          subtitle="Critical classifications"
          icon={ThumbsDown}
          variant="red"
        />
        <MetricCard
          title="Avg Review Length"
          value={`${INITIAL_FALLBACK_STATS.averageWordLength} words`}
          subtitle="Tokens per review sample"
          icon={FileText}
          variant="blue"
        />
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Positive vs Negative Reviews */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Positive vs Negative Reviews
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Class balance across the evaluated hotel reviews corpus.
            </p>
          </div>

          <div className="h-[260px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={binaryComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val.toLocaleString()} reviews`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {binaryComparisonData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Positive: <strong>{positiveReviews.toLocaleString()} ({posPct}%)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>Negative: <strong>{negativeReviews.toLocaleString()} ({negPct}%)</strong></span>
            </div>
          </div>
        </div>

        {/* Chart 2: Review Distribution by Rating */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Review Distribution by Rating
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Frequency histogram across 1-Star to 5-Star customer ratings.
              </p>
            </div>
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>

          <div className="h-[260px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RATING_DISTRIBUTION} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="rating" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} reviews`, 'Frequency']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {RATING_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`rating-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
            {ratingMeta?.message ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Info className="w-3.5 h-3.5" />
                {ratingMeta.message}
              </span>
            ) : (
              'Ratings 4 & 5 represent 54% of the complete dataset volume.'
            )}
          </div>
        </div>

      </div>

      {/* Top Keywords Frequency Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            Most Frequent Sentiment Keywords
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Positive Terms */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <div className="flex items-center gap-2 mb-3 text-emerald-800 font-semibold text-xs uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Top Positive Discriminators</span>
            </div>
            <div className="space-y-2">
              {TOP_KEYWORDS.positive.map((item) => (
                <div key={item.word} className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    "{item.word}"
                  </span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {item.count} occurrences
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Negative Terms */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
            <div className="flex items-center gap-2 mb-3 text-rose-800 font-semibold text-xs uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Top Negative Discriminators</span>
            </div>
            <div className="space-y-2">
              {TOP_KEYWORDS.negative.map((item) => (
                <div key={item.word} className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                    "{item.word}"
                  </span>
                  <span className="font-mono font-semibold text-rose-700">
                    {item.count} occurrences
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
