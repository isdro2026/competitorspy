import { useState } from 'react';

export default function ContentEngine() {
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!niche.trim()) return;
    setLoading(true);
    setError('');
    setContent(null);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche }),
      });
      const result = await response.json();
      if (result.success) {
        setContent(result.data);
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Content Engine</h1>
        <p className="text-slate-400 mb-8">Type a niche and generate ad copy, a blog post, and social captions all at once.</p>

        <form onSubmit={handleGenerate} className="flex gap-3 mb-8">
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. cold brew coffee subscription box"
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
        </form>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading && <p className="text-slate-400 mb-4">This can take 15-25 seconds while Claude writes everything...</p>}

        {content && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-white">Ad Copy</h2>
                <button
                  onClick={() => handleCopy(`${content.adCopy.headline}\n\n${content.adCopy.primaryText}\n\n${content.adCopy.cta}`, 'ad')}
                  className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded"
                >
                  {copiedKey === 'ad' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-white font-semibold mb-2">{content.adCopy.headline}</p>
              <p className="text-slate-300 mb-3">{content.adCopy.primaryText}</p>
              <span className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-semibold">{content.adCopy.cta}</span>
            </div>

            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-white">Blog Post</h2>
                <button
                  onClick={() => handleCopy(`${content.blogPost.title}\n\n${content.blogPost.content}`, 'blog')}
                  className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded"
                >
                  {copiedKey === 'blog' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-white font-semibold mb-2">{content.blogPost.title}</p>
              <p className="text-slate-300 whitespace-pre-line">{content.blogPost.content}</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-3">Social Captions</h2>
              <div className="space-y-4">
                {content.socialCaptions.map((s, i) => (
                  <div key={i} className="border-t border-slate-700 pt-4 first:border-0 first:pt-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-blue-400 font-semibold text-sm">{s.platform}</p>
                      <button
                        onClick={() => handleCopy(s.caption, `social-${i}`)}
                        className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded"
                      >
                        {copiedKey === `social-${i}` ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-slate-300 whitespace-pre-line">{s.caption}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
