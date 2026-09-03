// components/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';

export default function AnalyticsDashboard({ userId }) {
  const [analytics, setAnalytics] = useState(null);
  const [topCompetitors, setTopCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchTopCompetitors();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/get?userId=${userId}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopCompetitors = async () => {
    try {
      const response = await fetch(`/api/analytics/top-competitors?userId=${userId}&limit=5`);
      const data = await response.json();
      setTopCompetitors(data);
    } catch (error) {
      console.error('Failed to fetch top competitors:', error);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div style={styles.error}>Failed to load analytics</div>;
  }

  const { summary } = analytics;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 Your Activity Dashboard</h2>

      {/* Metrics Grid */}
      <div style={styles.metricsGrid}>
        <MetricCard 
          icon="👁️"
          label="Page Views"
          value={summary.totalPageViews}
          trend="+12%"
        />
        <MetricCard 
          icon="🔍"
          label="Competitor Searches"
          value={summary.totalSearches}
          trend="+8%"
        />
        <MetricCard 
          icon="⚙️"
          label="Features Used"
          value={summary.totalFeatures}
          trend="+15%"
        />
        <MetricCard 
          icon="✅"
          label="Scraper Success Rate"
          value={`${Math.round((summary.scraperSuccess / Math.max(summary.totalSearches, 1)) * 100)}%`}
          trend="+5%"
        />
      </div>

      {/* Top Competitors */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🏆 Top Competitors You're Tracking</h3>
        {topCompetitors.length > 0 ? (
          <div style={styles.competitorsList}>
            {topCompetitors.map((competitor, index) => (
              <div key={index} style={styles.competitorItem}>
                <span style={styles.competitorRank}>#{index + 1}</span>
                <span style={styles.competitorName}>{competitor.name}</span>
                <span style={styles.competitorCount}>{competitor.count} searches</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.emptyText}>No competitor searches yet</p>
        )}
      </div>

      {/* Recent Activity */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📋 Recent Activity (Last 30 Days)</h3>
        <div style={styles.activityStats}>
          <div style={styles.statItem}>
            <strong>{analytics.pageViews.length}</strong>
            <span>Page Views</span>
          </div>
          <div style={styles.statItem}>
            <strong>{analytics.searches.length}</strong>
            <span>Searches</span>
          </div>
          <div style={styles.statItem}>
            <strong>{analytics.scraperActivity.length}</strong>
            <span>Scraper Calls</span>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button style={styles.exportButton}>
        📥 Export Analytics Report
      </button>
    </div>
  );
}

function MetricCard({ icon, label, value, trend }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricIcon}>{icon}</div>
      <div style={styles.metricContent}>
        <div style={styles.metricLabel}>{label}</div>
        <div style={styles.metricValue}>{value}</div>
        <div style={styles.metricTrend}>{trend}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  metricCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    borderRadius: '8px',
    color: 'white',
    display: 'flex',
    gap: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
  metricIcon: {
    fontSize: '32px',
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: '13px',
    opacity: 0.8,
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '5px 0',
  },
  metricTrend: {
    fontSize: '12px',
    color: '#90ee90',
  },
  section: {
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
  },
  competitorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  competitorItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '10px',
    background: 'white',
    borderRadius: '6px',
    borderLeft: '4px solid #667eea',
  },
  competitorRank: {
    fontWeight: 'bold',
    color: '#667eea',
    minWidth: '30px',
  },
  competitorName: {
    flex: 1,
    fontSize: '16px',
    color: '#333',
  },
  competitorCount: {
    fontSize: '13px',
    color: '#999',
  },
  activityStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },
  statItem: {
    background: 'white',
    padding: '15px',
    borderRadius: '6px',
    textAlign: 'center',
  },
  exportButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#ef4444',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
    padding: '20px',
  },
};
