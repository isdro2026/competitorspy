import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/blog-posts')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setPosts(json.data);
        } else {
          setError(json.error || 'Failed to load posts');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 32, marginBottom: 8, color: '#f5f5f7' }}>Blog</h1>
      <p style={{ color: '#b8b8cc', marginBottom: 32 }}>
        Auto-generated content from the Content Engine.
      </p>

      {loading && <p>Loading posts...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p style={{ color: '#b8b8cc' }}>
          No posts published yet. Generate one from the Content Engine.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            style={{
              display: 'block',
              padding: 20,
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              textDecoration: 'none',
              color: '#f5f5f7',
            }}
          >
            <h2 style={{ fontSize: 20, marginBottom: 6 }}>{post.title}</h2>
            {post.niche && (
              <p style={{ fontSize: 13, color: '#ff8c00', marginBottom: 8 }}>
                Niche: {post.niche}
              </p>
            )}
            <p style={{ color: '#c9c9dc', fontSize: 14 }}>
              {post.content.slice(0, 160)}...
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
