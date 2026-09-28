export interface ReviewItem {
  id: string | number;
  review: string;
  sentiment: 'Positive' | 'Negative';
  confidence: number;
  date?: string;
}

export interface ClassificationDisplayResult {
  sentiment: 'Positive' | 'Negative';
  confidence: number;
  explanation: string;
  wordCount: number;
}

export const QUICK_EXAMPLES = {
  positive: 'The hotel was excellent. The room was clean and comfortable, and the staff were very friendly.',
  negative: 'The room was dirty and noisy. The staff were rude and the service was terrible.',
  neutral: 'The hotel is located near the city center. The room was average and the breakfast was available.',
};

export const INITIAL_FALLBACK_STATS = {
  totalReviews: 1000,
  positiveReviews: 720,
  negativeReviews: 280,
  modelAccuracy: '91.5%',
  averageWordLength: 82,
};

export const RATING_DISTRIBUTION = [
  { rating: '1 Star', count: 120, fill: '#DC2626' },
  { rating: '2 Star', count: 160, fill: '#F87171' },
  { rating: '3 Star', count: 180, fill: '#FBBF24' },
  { rating: '4 Star', count: 260, fill: '#60A5FA' },
  { rating: '5 Star', count: 280, fill: '#16A34A' },
];

export const TOP_KEYWORDS = {
  positive: [
    { word: 'clean', count: 485 },
    { word: 'friendly', count: 412 },
    { word: 'comfortable', count: 390 },
    { word: 'great', count: 354 },
    { word: 'excellent', count: 310 },
  ],
  negative: [
    { word: 'noisy', count: 198 },
    { word: 'dirty', count: 165 },
    { word: 'rude', count: 142 },
    { word: 'small', count: 120 },
    { word: 'slow', count: 98 },
  ],
};
