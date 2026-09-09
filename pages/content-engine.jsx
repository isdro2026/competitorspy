import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContentEngine() {
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState('');

  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [linkedinBanner, setLinkedinBanner] = useState(null);
  const [postingPlatform, setPostingPlatform] = useState('');
  const [postedPlatforms, setPostedPlatforms] = useState({});
  const [linkedinDraft, setLinkedinDraft] = useState('');

  useEffect(() => {
    checkSocialStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get('linkedin_connected')) {
      setLinkedinBanner({ type: 'success', message: 'LinkedIn connected!' });
    } else if (params.get('linkedin_error')) {
      setLinkedinBanner({ type: 'error', message: params.get('linkedin_error') });
    }
    if (params.get('linkedin_connected') || params.get('linkedin_error')) {
      window.history.replaceState({}, '', '/content-engine');
    }
  }, []);

  const checkSocialStatus = async () => {
    try {
      const res = await fetch('/api/social/status');
      const json = await res.json();
      if (json.success) {
        setLinkedinConnected(json.data.some((a) => a.platform === 'linkedin'));
      }
    } catch (err) {
      console.error('Error checking social status:', err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!niche.trim()) return;

    setLoading(true);
    setError('');
    setContent(null);
    setPublishedSlug('');
    setPostedPlatforms({});
    setLinkedinDraft('');

    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche }),
      });
      const json = await res.json();
      if (json.success) {
        setContent(json.data);
        const li = json.data.socialCaptions.find((c) => c.platform === 'LinkedIn');
        setLinkedinDraft(li ? li.caption : '');
      } else {
        setError(json.error || 'Failed to generate content');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handlePublish = async () => {
    if (!content?.blogPost) return;
    setPublishing(true);
    setError('');

    try {
      const res = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          title: content.blogPost.title,
          content: content.blogPost.content,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPublishedSlug(json.data.slug);
      } else {
        setError(json.error || 'Failed to publish post');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handlePostToLinkedIn = async () => {
    if (!linkedinDraft.trim()) return;
    setPostingPlatform('LinkedIn');
    setLinkedinBanner(null);

    try {
      const res = await fetch('/api/social/post-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: linkedinDraft }),
      });
      const json = await res.json();
      if (json.success) {
        setPostedPlatforms((prev) => ({ ...prev, LinkedIn: true }));
      } else {
        setLinkedinBanner({ type: 'error', message: json.error || 'Failed to post to LinkedIn' });
      }
    } catch (err) {
      setLinkedinBanner({ type: 'error', message: err.message });
    } finally {
      setPostingPlatform('');
    }
  };

  const cardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  };

  const copyBtnStyle = {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid #ccc',
    background: '#fafafa',
    cursor: 'pointer',
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Content Engine</h1>
      <p style={{ color: '#666', marginBottom: 8 }}>
        Generate ad copy, a blog post, and social captions for any niche.
      </p>
      <p style={{ marginBottom: 24 }}>
        <Link href="/schedules" style={{ fontSize: 13, color: '#0070f3' }}>
          Set up auto-posting schedules -&gt;
        </Link>
      </p>

      {linkedinBanner && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 6,
            marginBottom: 20,
            fontSize: 13,
            background: linkedinBanner.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: linkedinBanner.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          {linkedinBanner.message}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          marginBottom: 24,
          fontSize: 13,
        }}
      >
        <span>
          LinkedIn: {linkedinConnected ? <strong style={{ color: '#16a34a' }}>Connected</strong> : 'Not connected'}
        </span>
        {!linkedinConnected && (
          <a
            href="/api/auth/linkedin"
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: '#0a66c2',
              color: '#fff',
              fontWeight: 600,
              fontSize: 12,
              textDecoration: 'none',
            }}
          >
            Connect LinkedIn
          </a>
        )}
      </div>

      <form onSubmit={handleGenerate} style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
        <input
          type="text"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="e.g. organic dog treats"
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: 'none',
            background: '#0070f3',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginBottom: 20 }}>{error}</p>}

      {content && (
        <>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18 }}>Ad Copy</h2>
              <button
                style={copyBtnStyle}
                onClick={() =>
                  handleCopy(
                    'adCopy',
                    `${content.adCopy.headline}\n${content.adCopy.primaryText}\n${content.adCopy.cta}`
                  )
                }
              >
                {copiedKey === 'adCopy' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p style={{ marginTop: 10 }}><strong>{content.adCopy.headline}</strong></p>
            <p style={{ marginTop: 6, color: '#444' }}>{content.adCopy.primaryText}</p>
            <p style={{ marginTop: 6, color: '#0070f3', fontWeight: 600 }}>{content.adCopy.cta}</p>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18 }}>Blog Post</h2>
              <button
                style={copyBtnStyle}
                onClick={() =>
                  handleCopy('blogPost', `${content.blogPost.title}\n\n${content.blogPost.content}`)
                }
              >
                {copiedKey === 'blogPost' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p style={{ marginTop: 10, fontWeight: 600 }}>{content.blogPost.title}</p>
            <p style={{ marginTop: 6, color: '#444', whiteSpace: 'pre-wrap' }}>
              {content.blogPost.content}
            </p>

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={handlePublish}
                disabled={publishing || !!publishedSlug}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: publishedSlug ? '#999' : '#16a34a',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: publishing || publishedSlug ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                }}
              >
                {publishedSlug ? 'Published' : publishing ? 'Publishing...' : 'Publish to Blog'}
              </button>
              {publishedSlug ? (
                <a
                  href={'/blog/' + publishedSlug}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 13, color: '#0070f3' }}
                >
                  View live post -&gt;
                </a>
              ) : null}
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, marginBottom: 10 }}>Social Captions</h2>
            {content.socialCaptions.map((item) => {
              const isLinkedIn = item.platform === 'LinkedIn';
              return (
                <div
                  key={item.platform}
                  style={{
                    borderTop: '1px solid #eee',
                    paddingTop: 12,
                    marginTop: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 14 }}>{item.platform}</strong>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isLinkedIn && linkedinConnected && (
                        <button
                          style={{
                            ...copyBtnStyle,
                            background: postedPlatforms.LinkedIn ? '#dcfce7' : '#0a66c2',
                            color: postedPlatforms.LinkedIn ? '#166534' : '#fff',
                            border: 'none',
                          }}
                          disabled={postingPlatform === 'LinkedIn' || postedPlatforms.LinkedIn || !linkedinDraft.trim()}
                          onClick={handlePostToLinkedIn}
                        >
                          {postedPlatforms.LinkedIn
                            ? 'Posted!'
                            : postingPlatform === 'LinkedIn'
                            ? 'Posting...'
                            : 'Post to LinkedIn'}
                        </button>
                      )}
                      <button
                        style={copyBtnStyle}
                        onClick={() => handleCopy(item.platform, isLinkedIn ? linkedinDraft : item.caption)}
                      >
                        {copiedKey === item.platform ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {isLinkedIn && linkedinConnected ? (
                    <>
                      <textarea
                        value={linkedinDraft}
                        onChange={(e) => {
                          setLinkedinDraft(e.target.value);
                          setPostedPlatforms((prev) => ({ ...prev, LinkedIn: false }));
                        }}
                        disabled={postingPlatform === 'LinkedIn' || postedPlatforms.LinkedIn}
                        rows={5}
                        style={{
                          marginTop: 6,
                          width: '100%',
                          fontFamily: 'inherit',
                          fontSize: 14,
                          color: '#222',
                          padding: 10,
                          borderRadius: 6,
                          border: '1px solid #ccc',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                        }}
                      />
                      <p style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
                        Preview and edit before posting -- this is exactly what will be published to LinkedIn.
                      </p>
                    </>
                  ) : (
                    <p style={{ marginTop: 6, color: '#444', whiteSpace: 'pre-wrap', fontSize: 14 }}>
                      {item.caption}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
