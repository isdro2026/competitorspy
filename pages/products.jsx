import { useState, useEffect } from 'react';
import Link from 'next/link';

const PLATFORM_LABELS = {
  amazon: 'Amazon',
  ebay: 'eBay',
  walmart: 'Walmart',
  bestbuy: 'Best Buy',
  other: 'Other',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [platform, setPlatform] = useState('amazon');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      } else {
        setError(json.error || 'Failed to load products');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim() || !productUrl.trim()) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          productUrl: productUrl.trim(),
          imageUrl: imageUrl.trim(),
          platform,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setName('');
        setProductUrl('');
        setImageUrl('');
        setPlatform('amazon');
        await loadProducts();
      } else {
        setError(json.error || 'Failed to add product');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const cardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    background: '#fff',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: 14,
    boxSizing: 'border-box',
    marginBottom: 10,
  };

  const btnStyle = {
    padding: '10px 20px',
    borderRadius: 6,
    border: 'none',
    background: '#16a34a',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8, color: '#fff' }}>Product Library</h1>
      <p style={{ color: '#ddd', marginBottom: 8 }}>
        Save products you want to promote (Amazon, eBay, Walmart, Best Buy). Attach one to any
        generated article or scheduled post so readers can click through and buy.
      </p>
      <p style={{ marginBottom: 24 }}>
        <Link href="/content-engine" style={{ fontSize: 13, color: '#7ab8ff' }}>
          &lt;- Back to Content Engine
        </Link>
        {' \u00b7 '}
        <Link href="/schedules" style={{ fontSize: 13, color: '#7ab8ff' }}>
          Scheduled Posts
        </Link>
      </p>

      <div style={{ ...cardStyle, marginBottom: 30 }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#222' }}>
          Product name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Organic Dog Treats - 12oz Bag"
          style={inputStyle}
        />

        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#222' }}>
          Product / affiliate URL
        </label>
        <input
          type="text"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://www.amazon.com/dp/XXXXXXX?tag=youraffiliateid"
          style={inputStyle}
        />
        <p style={{ fontSize: 12, color: '#888', marginTop: -6, marginBottom: 10 }}>
          Paste your full affiliate link (with your Amazon Associates / eBay Partner Network /
          Walmart Creator / Best Buy tag already in it) so clicks are tracked to you.
        </p>

        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#222' }}>
          Product image URL (optional)
        </label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          style={inputStyle}
        />

        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#222' }}>
          Platform
        </label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          style={{ ...inputStyle, marginBottom: 14 }}
        >
          <option value="amazon">Amazon</option>
          <option value="ebay">eBay</option>
          <option value="walmart">Walmart</option>
          <option value="bestbuy">Best Buy</option>
          <option value="other">Other</option>
        </select>

        <button
          onClick={handleAdd}
          disabled={saving || !name.trim() || !productUrl.trim()}
          style={{
            ...btnStyle,
            cursor: saving || !name.trim() || !productUrl.trim() ? 'not-allowed' : 'pointer',
            opacity: saving || !name.trim() || !productUrl.trim() ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Add Product'}
        </button>
      </div>

      {error && <p style={{ color: '#ff8080', marginBottom: 20 }}>{error}</p>}

      {loading ? (
        <p style={{ color: '#ddd' }}>Loading...</p>
      ) : products.length === 0 ? (
        <p style={{ color: '#ddd' }}>No products saved yet. Add one above.</p>
      ) : (
        products.map((p) => (
          <div key={p.id} style={{ ...cardStyle, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            {p.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image_url}
                alt={p.name}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <strong style={{ fontSize: 15, color: '#222' }}>{p.name}</strong>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #fca5a5',
                    background: '#fef2f2',
                    color: '#991b1b',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
              <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>
                {PLATFORM_LABELS[p.platform] || p.platform}
              </span>
              <div style={{ marginTop: 6 }}>
                <a
                  href={p.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: '#0070f3', wordBreak: 'break-all' }}
                >
                  {p.product_url}
                </a>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
