import { useState } from 'react';

export default function LandingPageBuilder() {
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!niche.trim()) return;
    setLoading(true);
    setError('');
    setHtml('');
    try {
      const response = await fetch('/api/generate-landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche }),
      });
      const result = await response.json();
      if (result.success) {
        setHtml(result.html);
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${niche.trim().toLowerCase().replace(/\s+/g, '-')}-landing-page.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Landing Page Builder</h1>
        <p className="text-slate-400 mb-8">Type a niche and get a ready-to-use landing page, generated automatically.</p>

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
            {loading ? 'Generating...' : 'Generate Landing Page'}
          </button>
        </form>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {loading && (
          <p className="text-slate-400">This can take 20-30 seconds while Claude writes and designs the page...</p>
        )}

        {html && (
          <div>
            <div className="flex justify-end mb-3">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm"
              >
                Download HTML
              </button>
            </div>
            <div className="bg-white rounded-lg border border-slate-700 overflow-hidden" style={{ height: '80vh' }}>
              <iframe
                title="Landing Page Preview"
                srcDoc={html}
                className="w-full h-full"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
