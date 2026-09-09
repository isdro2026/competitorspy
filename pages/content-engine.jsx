import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContentEngine() {
  const [niche, setNiche] = useState('');
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProducts(json.data);
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!niche.trim()) return;

    setLoading(true);
    setError('');
    setContent(null);
    setPublishedSlug('');

    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, productId: productId || null }),
      });
      const json = await res.json();
      if (json.success) {
        setContent(json.data);
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

  const cardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    background: '#fff',
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
      <h1 style={{ fontSize: 28, marginBottom: 8, color: '#fff' }}>Content Engine</h1>
      <p style={{ color: '#ddd', marginBottom: 8 }}>
        Generate ad copy, a blog post, and social captions for any niche.
      </p>
      <p style={{ marginBottom: 24 }}>
        <Link href="/schedules" style={{ fontSize: 13, color: '#7ab8ff' }}>
          Set up auto-posting schedules -&gt;
        </Link>
        {' \u00b7 '}
        <Link href="/products" style={{ fontSize: 13, color: '#7ab8ff' }}>
          Product Library
        </Link>
      </p>

      <form onSubmit={handleGenerate} style={{ marginBottom: 30 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
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
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#ddd' }}>
          Promote a product (optional)
        </label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 14,
          }}
        >
          <option value="">No product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.platform})
            </option>
          ))}
        </select>
        {products.length === 0 && (
          <p style={{ fontSize: 12, color: '#ddd', marginTop: 6 }}>
            No products saved yet -- add one in the{' '}
            <Link href="/products" style={{ color: '#7ab8ff' }}>Product Library</Link>.
          </p>
        )}
      </form>

      {error && <p style={{ color: '#ff8080', marginBottom: 20 }}>{error}</p>}

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
            {content.socialCaptions.map((item) => (
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
                  <button
                    style={copyBtnStyle}
                    onClick={() => handleCopy(item.platform, item.caption)}
                  >
                    {copiedKey === item.platform ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ marginTop: 6, color: '#444', whiteSpace: 'pre-wrap', fontSize: 14 }}>
                  {item.caption}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
