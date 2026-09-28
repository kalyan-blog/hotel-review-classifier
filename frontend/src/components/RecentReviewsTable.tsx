import React from 'react';
import type { ReviewItem } from '../data/reviewData';
import { ThumbsUp, ThumbsDown, Clock } from 'lucide-react';

interface RecentReviewsTableProps {
  reviews: ReviewItem[];
}

export const RecentReviewsTable: React.FC<RecentReviewsTableProps> = ({ reviews }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Recent Review Classifications
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inference logs and historical test reviews.
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {reviews.length} logs
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th scope="col" className="px-5 py-3">Review</th>
              <th scope="col" className="px-5 py-3">Sentiment</th>
              <th scope="col" className="px-5 py-3">Confidence</th>
              <th scope="col" className="px-5 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-xs text-slate-400 italic">
                  No classified reviews recorded yet. Submit a review in the Review Classifier tab.
                </td>
              </tr>
            ) : (
              reviews.map((item) => {
                const isPos = item.sentiment === 'Positive';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs sm:max-w-md truncate font-medium text-slate-800">
                      "{item.review}"
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          isPos
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isPos ? (
                          <ThumbsUp className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ThumbsDown className="w-3 h-3 text-rose-600" />
                        )}
                        {item.sentiment}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        <span>{item.confidence.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.date || 'Recent'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
