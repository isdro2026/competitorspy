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

          {post.product_link && (
            <a
              href={post.product_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 20,
                padding: 14,
                borderRadius: 8,
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                textDecoration: 'none',
              }}
            >
              {post.product_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.product_image_url}
                  alt={post.product_name || 'Featured product'}
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                />
              )}
              <div>
                <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>
                  Featured product
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#222' }}>{post.product_name}</div>
                <div style={{ fontSize: 13, color: '#7c3aed', marginTop: 2 }}>Shop this product &gt;</div>
              </div>
            </a>
          )}
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
