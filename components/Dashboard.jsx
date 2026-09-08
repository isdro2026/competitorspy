// components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Search, BarChart3, Zap, Target, Mail } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';

const ANALYTICS_USER_ID = 'demo-user';

// Fire-and-forget analytics tracking — never blocks the UI on failure
const trackEvent = (eventType, data = {}) => {
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: ANALYTICS_USER_ID, eventType, data })
  }).catch((error) => console.error('Analytics tracking error:', error));
};

export default function Dashboard() {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingReportId, setSendingReportId] = useState(null);
  const [activeTab, setActiveTab] = useState('scraper');
  const [formData, setFormData] = useState({
    competitorName: '',
    website: '',
    industry: ''
  });

  const [generatorData, setGeneratorData] = useState({
    competitorId: '',
    contentType: 'blog_post',
    platform: 'blog'
  });

  // Fetch competitors on mount
  useEffect(() => {
    fetchCompetitors();
    trackEvent('page_view', { page: 'dashboard' });
  }, []);

  const fetchCompetitors = async () => {
    try {
      const response = await fetch('/api/competitors');
      const result = await response.json();
      setCompetitors(result.data || []);
    } catch (error) {
      console.error('Error fetching competitors:', error);
    }
  };

  // Add new competitor
  const handleAddCompetitor = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
    const response = await fetch('/api/competitors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: formData.competitorName, website: formData.website, industry: formData.industry })
});

const result = await response.json();
      if (result.success) {
        trackEvent('competitor_search', {
          competitorName: formData.competitorName,
          results: result.data ? 1 : 0
        });
        setFormData({ competitorName: '', website: '', industry: '' });
        fetchCompetitors();
        alert('Competitor added!');
      }
    } catch (error) {
      alert('Error adding competitor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Scrape competitor website
  const handleScrape = async (competitorId, website) => {
    setLoading(true);

    try {
      const response = await fetch('/api/scrape-competitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: website,
          competitorId
        })
      });

      const result = await response.json();
      if (result.success) {
        trackEvent('scraper', { url: website, success: true });
        alert('Scraping complete! Keywords extracted: ' + result.data.keywords.length);
        console.log('Scraped data:', result.data);
      } else {
        trackEvent('scraper', { url: website, success: false, errorMessage: result.error });
      }
    } catch (error) {
      trackEvent('scraper', { url: website, success: false, errorMessage: error.message });
      alert('Error scraping: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Email a competitor report via Resend
  const handleSendReport = async (competitor) => {
    const email = window.prompt('Send this competitor report to which email address?');
    if (!email) return;

    setSendingReportId(competitor.id);

    try {
      const response = await fetch('/api/email/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          competitorData: {
            competitor: competitor.name,
            url: competitor.website,
            industry: competitor.industry,
            insights: [
              'Report generated from your CompetitorSpy dashboard.',
              'Scrape this competitor for updated keyword insights.'
            ]
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Report sent to ' + email + '!');
      } else {
        alert('Error sending report: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error sending report: ' + error.message);
    } finally {
      setSendingReportId(null);
    }
  };

  // Generate content
  const handleGenerateContent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const competitor = competitors.find(c => c.id == generatorData.competitorId);

      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: generatorData.contentType,
          platform: generatorData.platform,
          competitorName: competitor?.name || 'competitor',
          competitorKeywords: ['marketing', 'automation'],
          competitorContent: 'Sample content',
          productName: 'Your Product'
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Content generated! Check console for output');
        console.log('Generated content:', result.data);
      }
    } catch (error) {
      alert('Error generating content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Target className="w-8 h-8 text-blue-500" />
            CompetitorSpy
          </h1>
          <p className="text-slate-400 mt-1">AI-Powered Competitor Analysis & Content Generation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 px-6">
        <div className="max-w-7xl mx-auto flex gap-8">
          <button
            onClick={() => setActiveTab('scraper')}
            className={`py-4 px-2 border-b-2 font-semibold transition ${
              activeTab === 'scraper'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Competitor Scraper
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`py-4 px-2 border-b-2 font-semibold transition ${
              activeTab === 'generator'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Content Generator
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-2 border-b-2 font-semibold transition ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Scraper Tab */}
        {activeTab === 'scraper' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Competitor Form */}
            <div className="lg:col-span-1 bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Add Competitor</h2>
              <form onSubmit={handleAddCompetitor} className="space-y-4">
                <input
                  type="text"
                  placeholder="Competitor Name"
                  value={formData.competitorName}
                  onChange={(e) => setFormData({...formData, competitorName: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Website URL"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Competitor'}
                </button>
              </form>
            </div>

            {/* Competitors List */}
            <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Your Competitors</h2>
              <div className="space-y-3">
                {competitors.map((competitor) => (
                  <div key={competitor.id} className="bg-slate-700 p-4 rounded border border-slate-600 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-white">{competitor.name}</h3>
                      <p className="text-slate-400 text-sm">{competitor.website}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleScrape(competitor.id, competitor.website)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold disabled:opacity-50"
                      >
                        {loading ? 'Scraping...' : 'Scrape'}
                      </button>
                      <button
                        onClick={() => handleSendReport(competitor)}
                        disabled={sendingReportId === competitor.id}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold disabled:opacity-50 flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {sendingReportId === competitor.id ? 'Sending...' : 'Send Report'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generator Tab */}
        {activeTab === 'generator' && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Generate Content</h2>
            <form onSubmit={handleGenerateContent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={generatorData.competitorId}
                onChange={(e) => setGeneratorData({...generatorData, competitorId: e.target.value})}
                className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="">Select Competitor</option>
                {competitors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={generatorData.contentType}
                onChange={(e) => setGeneratorData({...generatorData, contentType: e.target.value})}
                className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="blog_post">Blog Post</option>
                <option value="social_media">Social Media</option>
                <option value="ad_copy">Ad Copy</option>
                <option value="landing_page">Landing Page</option>
              </select>

              <select
                value={generatorData.platform}
                onChange={(e) => setGeneratorData({...generatorData, platform: e.target.value})}
                className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="blog">Blog</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
              </select>

              <button
                type="submit"
                disabled={loading || !generatorData.competitorId}
                className="md:col-span-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Content'}
              </button>
            </form>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
         <AnalyticsDashboard userId="demo-user"/>
        )}
      </div>
    </div>
  );
}
