import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const TOOLS = [
  {
    href: '/',
    title: 'Niche Finder',
    description: 'Discover profitable niches and see what competitors are doing.',
    icon: '🔎',
  },
  {
    href: '/keyword-research',
    title: 'Keyword Research',
    description: 'Look up search volume, CPC, and competition for any keyword.',
    icon: '🔑',
  },
  {
    href: '/landing-page-builder',
    title: 'Landing Page Builder',
    description: 'Generate a ready-to-use landing page for a niche or product.',
    icon: '🧱',
  },
  {
    href: '/content-engine',
    title: 'Content Engine',
    description: 'Generate ad copy, blog posts, and social captions in one click.',
    icon: '✍️',
  },
  {
    href: '/blog',
    title: 'Blog',
    description: 'View and manage published blog posts.',
    icon: '📰',
  },
  {
    href: '/schedules',
    title: 'Auto-Posting Schedules',
    description: 'Set up recurring content generation and posting.',
    icon: '🗓️',
  },
  {
    href: '/products',
    title: 'Product Library',
    description: 'Manage products you promote across ad copy and social posts.',
    icon: '🛍️',
  },
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

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>
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
                  <href={p.connectHref}
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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {TOOLS.map((tool) => (
          <Link key={tool.href} href={tool.href} style={cardStyle}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{tool.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{tool.title}</div>
            <div style={{ fontSize: 13, color: '#666' }}>{tool.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
