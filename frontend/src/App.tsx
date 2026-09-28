import { useState, useEffect, useCallback } from 'react';
import { Header, type ActiveTab } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { ReviewClassifier } from './pages/ReviewClassifier';
import { DatasetInsights } from './pages/DatasetInsights';
import type { ReviewItem } from './data/reviewData';
import { 
  getDashboardStats, 
  getSentimentDistribution, 
  getRecentReviews, 
  type DashboardStats, 
  type SentimentDistribution 
} from './services/api';
import { Hotel } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sentimentDist, setSentimentDist] = useState<SentimentDistribution | null>(null);
  const [recentReviews, setRecentReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Fetch all live dashboard and classification logs from FastAPI backend
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setNetworkError(null);

    try {
      const [statsData, distData, recentData] = await Promise.all([
        getDashboardStats(),
        getSentimentDistribution(),
        getRecentReviews(),
      ]);

      setStats(statsData);
      setSentimentDist(distData);

      // Map backend recent reviews to frontend items
      const formattedRecent: ReviewItem[] = recentData.map((item) => ({
        id: item.id,
        review: item.review,
        sentiment: item.sentiment,
        confidence: item.confidence,
        date: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      setRecentReviews(formattedRecent);
    } catch (err: any) {
      console.warn('Backend connection notice:', err.message);
      setNetworkError('Unable to connect to the classification server. Using local cache.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAddRecentReview = (item: ReviewItem) => {
    setRecentReviews((prev) => [item, ...prev.slice(0, 9)]);
    // Re-fetch stats so card metrics and distribution stay in sync with database
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col antialiased">
      {/* Top Navigation */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            sentimentDist={sentimentDist}
            recentReviews={recentReviews}
            isLoading={isLoading}
            error={networkError}
            onNavigateToClassifier={() => setActiveTab('classifier')}
            onRefresh={fetchDashboardData}
          />
        )}
        {activeTab === 'classifier' && (
          <ReviewClassifier 
            onAddRecentReview={handleAddRecentReview}
            onRefreshStats={fetchDashboardData}
          />
        )}
        {activeTab === 'insights' && (
          <DatasetInsights stats={stats} />
        )}
      </main>

      {/* Clean Light Footer (Section 14) */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
              <Hotel className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">
              Hotel Review Classifier
            </span>
            <span className="text-slate-300">|</span>
            <span>AI-powered sentiment analysis demonstration</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
              Educational / Project Demonstration
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
