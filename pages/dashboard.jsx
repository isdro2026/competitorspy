import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NicheFinder from './niche-finder';
import KeywordResearch from './keyword-research';
import LandingPageBuilder from './landing-page-builder';
import ContentEngine from './content-engine';
import BlogIndex from './blog/index';
import Schedules from './schedules';
import Products from './products';

const TOOL_TABS = [
  { key: 'niche-finder', title: 'Niche Finder', icon: '🔎', Component: NicheFinder },
  { key: 'keyword-research', title: 'Keyword Research', icon: '🔑', Component: KeywordResearch },
  { key: 'landing-page-builder', title: 'Landing Page Builder', icon: '🧱', Component: LandingPageBuilder },
  { key: 'content-engine', title: 'Content Engine', icon: '✍️', Component: ContentEngine },
  { key: 'blog', title: 'Blog', icon: '📰', Component: BlogIndex },
  { key: 'schedules', title: 'Auto-Posting Schedules', icon: '🗓️', Component: Schedules },
  { key: 'products', title: 'Product Library', icon: '🛍️', Component: Products },
];

const PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', connectHref: '/api/auth/linkedin', color: '#0a66c2' },
  { key: 'facebook', label: 'Facebook', connectHref: null, color: '#1877f2' },
  { key: 'instagram', label: 'Instagram', connectHref: null, color: '#e1306c' },
];

const cardStyle = {
  border: '1px solid #e0e0e0',
  borderRadius: 10,
  padding: 20,
  background: '#fff',
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  transition: 'box-shadow 0.15s ease',
};

export default function Dashboard() {
  const router = useRouter();
  const [connected, setConnected] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [banner, setBanner] = useState(null);
  const [activeTab, setActiveTab] = useState('niche-finder');

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const { linkedin_connected, linkedin_error } = router.query;
    if (linkedin_connected) {
      setBanner({ type: 'success', text: 'LinkedIn connected successfully.' });
      loadStatus();
    } else if (linkedin_error) {
      setBanner({ type: 'error', text: `LinkedIn connection failed: ${linkedin_error}` });
    }
  }, [router.isReady, router.query]);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/social/status');
      const json = await res.json();
      if (json.success) setConnected(json.data);
    } catch (err) {
      // non-fatal
    } finally {
      setLoadingStatus(false);
    }
  };

  const isConnected = (platform) => connected.some((c) => c.platform === platform);
  const connectedAccount = (platform) => connected.find((c) => c.platform === platform);

  const activeTool = TOOL_TABS.find((t) => t.key === activeTab) || TOOL_TABS[0];
  const ActiveComponent = activeTool.Component;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 30, marginBottom: 8, color: '#fff' }}>Dashboard</h1>
      <p style={{ color: '#ddd', marginBottom: 30 }}>
        Everything in CompetitorSpy, in one place.
      </p>

      {banner && (
        <div
          style={{
            marginBottom: 24,
            padding: '12px 16px',
            borderRadius: 8,
            background: banner.type === 'success' ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${banner.type === 'success' ? '#86efac' : '#fca5a5'}`,
            color: banner.type === 'success' ? '#166534' : '#991b1b',
            fontSize: 14,
          }}
        >
          {banner.text}
        </div>
      )}

      <h2 style={{ fontSize: 16, color: '#fff', marginBottom: 12 }}>Connected Accounts</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 36,
        }}
      >
        {PLATFORMS.map((p) => {
          const account = connectedAccount(p.key);
          const connectedNow = isConnected(p.key);
          return (
            <div
              key={p.key}
              style={{
                ...cardStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: connectedNow ? '#16a34a' : '#888', marginTop: 4 }}>
                  {loadingStatus
                    ? 'Checking...'
                    : connectedNow
                    ? `Connected${account?.account_name ? ` as ${account.account_name}` : ''}`
                    : 'Not connected'}
                </div>
              </div>
              {connectedNow ? (
                <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓ Active</span>
              ) : p.connectHref ? (
                <a
                  href={p.connectHref}
                  style={{
                    fontSize: 12,
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: p.color,
                    color: '#fff',
                    fontWeight: 600,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Connect
                </a>
              ) : (
                <span style={{ fontSize: 11, color: '#aaa' }}>Coming soon</span>
              )}
            </div>
          );
        })}
      </div>

      <h2 style={{ fontSize: 16, color: '#fff', marginBottom: 12 }}>Tools</h2>
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          borderBottom: '1px solid #333',
          marginBottom: 24,
          paddingBottom: 0,
        }}
      >
        {TOOL_TABS.map((tab) => {
          const isActiveTab = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isActiveTab ? '2px solid #ff8c00' : '2px solid transparent',
                background: isActiveTab ? '#fff' : 'transparent',
                color: isActiveTab ? '#111' : '#ccc',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon} {tab.title}
            </button>
          );
        })}
      </div>

      <div>
        <ActiveComponent key={activeTool.key} />
      </div>
    </div>
  );
}
