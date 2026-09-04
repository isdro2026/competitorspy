import { useState } from 'react';

export default function NicheFinder() {
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [addedIds, setAddedIds] = useState([]);
  const [error, setError] = useState('');

  const handleFind = async (e) => {
    e.preventDefault();
    if (!niche.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const response = await fetch('/api/find-competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche }),
      });
      const result = await response.json();
      if (result.success) {
        setResults(result.data || []);
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (competitor, index) => {
    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitorName: competitor.name,
          website: competitor.website,
          industry: competitor.industry,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setAddedIds((prev) => [...prev, index]);
      }
    } catch (err) {
      alert('Error adding competitor: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Niche Competitor Finder</h1>
        <p className="text-slate-400 mb-8">Type a niche and find its top 10 real competitors automatically.</p>

        <form onSubmit={handleFind} className="flex gap-3 mb-8">
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. cold brew subscription boxes"
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Finding...' : 'Find Top 10'}
          </button>
        </form>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <div className="space-y-3">
          {results.map((c, i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{c.name}</p>
                <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline">{c.website}</a>
              </div>
              <button
                onClick={() => handleAdd(c, i)}
                disabled={addedIds.includes(i)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50 disabled:bg-green-600"
              >
                {addedIds.includes(i) ? 'Added ✓' : 'Add to My Competitors'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
