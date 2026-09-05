import { useState } from 'react';

export default function KeywordResearch() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const response = await fetch('/api/keyword-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
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

  const competitionColor = (level) => {
    if (level === 'LOW') return 'text-green-400';
    if (level === 'MEDIUM') return 'text-yellow-400';
    if (level === 'HIGH') return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Keyword Research</h1>
        <p className="text-slate-400 mb-8">Type a niche or seed keyword to see real search volume, CPC, and competition data.</p>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. cold brew coffee"
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Get Keyword Data'}
          </button>
        </form>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {results.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="px-4 py-3">Keyword</th>
                  <th className="px-4 py-3">Search Volume</th>
                  <th className="px-4 py-3">CPC</th>
                  <th className="px-4 py-3">Competition</th>
                </tr>
              </thead>
              <tbody>
                {results.map((k, i) => (
                  <tr key={i} className="border-b border-slate-700 last:border-0">
                    <td className="px-4 py-3 text-white">{k.keyword}</td>
                    <td className="px-4 py-3 text-slate-300">{k.searchVolume?.toLocaleString() ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{k.cpc ? `$${k.cpc.toFixed(2)}` : '—'}</td>
                    <td className={`px-4 py-3 font-semibold ${competitionColor(k.competition)}`}>{k.competition ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
