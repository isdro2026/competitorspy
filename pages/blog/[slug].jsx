import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog-posts/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setPost(json.data);
        } else {
          setError(json.error || 'Post not found');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
      <Link href="/blog" style={{ color: '#7ab8ff', fontSize: 14 }}>
        ← Back to Blog
      </Link>

      {loading && <p style={{ marginTop: 20, color: '#ddd' }}>Loading...</p>}
      {error && <p style={{ marginTop: 20, color: '#ff8080' }}>{error}</p>}

      {post && (
        <article
          style={{
            marginTop: 20,
            background: '#fff',
            borderRadius: 8,
            padding: 24,
            border: '1px solid #e0e0e0',
          }}
        >
          <h1 style={{ fontSize: 32, marginBottom: 8, color: '#111' }}>{post.title}</h1>
          {post.niche && (
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
              Niche: {post.niche} · {new Date(post.created_at).toLocaleDateString()}
            </p>
          )}
          <div style={{ fontSize: 16, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#222' }}>
            {post.content}
          </div>
        </article>
      )}
    </div>
  );
}
