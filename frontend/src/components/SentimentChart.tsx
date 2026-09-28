import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ThumbsUp, ThumbsDown, Smile } from 'lucide-react';

interface SentimentChartProps {
  positive?: number;
  negative?: number;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({
  positive = 720,
  negative = 280,
}) => {
  const total = positive + negative;
  const posPct = total > 0 ? Math.round((positive / total) * 100) : 72;
  const negPct = total > 0 ? 100 - posPct : 28;

  const chartData = [
    { name: 'Positive', value: positive, percentage: posPct, color: '#16A34A' },
    { name: 'Negative', value: negative, percentage: negPct, color: '#DC2626' },
  ];

  const overallSentiment = posPct >= 50 ? 'Mostly Positive' : 'Mostly Negative';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">
          Review Sentiment Overview
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Proportional split between favorable and critical customer reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Donut Chart */}
        <div className="md:col-span-6 h-[220px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any, item: any) => [
                  `${value.toLocaleString()} reviews (${item.payload.percentage}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-bold text-slate-800 font-mono">
              {total.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Reviews
            </span>
          </div>
        </div>

        {/* Right: Summary Metrics */}
        <div className="md:col-span-6 space-y-3.5">
          <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Positive Reviews</span>
                <span className="text-[11px] text-emerald-700">{posPct}% of dataset</span>
              </div>
            </div>
            <span className="text-base font-bold text-emerald-800 font-mono">
              {positive.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-rose-50/80 border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center">
                <ThumbsDown className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Negative Reviews</span>
                <span className="text-[11px] text-rose-700">{negPct}% of dataset</span>
              </div>
            </div>
            <span className="text-base font-bold text-rose-800 font-mono">
              {negative.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-blue-600" />
              Overall Sentiment:
            </span>
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {overallSentiment}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
