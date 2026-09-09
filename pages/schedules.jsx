import { useState, useEffect } from 'react';
import Link from 'next/link';

function detectInputType(value) {
  return /^https?:\/\//i.test(value.trim()) ? 'url' : 'niche';
}

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [previewCaption, setPreviewCaption] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedules');
      const json = await res.json();
      if (json.success) {
        setSchedules(json.data);
      } else {
        setError(json.error || 'Failed to load schedules');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!inputValue.trim()) return;
    setPreviewing(true);
    setError('');
    setPreviewCaption('');

    try {
      const res = await fetch('/api/generate-caption-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputType: detectInputType(inputValue),
          inputValue: inputValue.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPreviewCaption(json.caption);
      } else {
        setError(json.error || 'Failed to generate preview');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPreviewing(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!inputValue.trim() || !previewCaption.trim()) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputType: detectInputType(inputValue),
          inputValue: inputValue.trim(),
          frequency,
          previewCaption,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setInputValue('');
        setPreviewCaption('');
        setFrequency('daily');
        await loadSchedules();
      } else {
        setError(json.error || 'Failed to create schedule');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, active) => {
    try {
      await fetch('/api/schedules/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
      await loadSchedules();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await fetch('/api/schedules/' + id, { method: 'DELETE' });
      await loadSchedules();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
  };

  const cardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    background: '#fff',
  };

  const btnStyle = {
    padding: '10px 20px',
    borderRadius: 6,
    border: 'none',
    background: '#0070f3',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  };

  const inputType = detectInputType(inputValue || '');

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8, color: '#fff' }}>Scheduled Posts</h1>
      <p style={{ color: '#ddd', marginBottom: 8 }}>
        Type a niche or paste a URL, preview and tweak the LinkedIn post, then set it to auto-post
        daily, weekly, or monthly.
      </p>
      <p style={{ marginBottom: 24 }}>
        <Link href="/content-engine" style={{ fontSize: 13, color: '#7ab8ff' }}>
          &lt;- Back to Content Engine
        </Link>
      </p>

      <div style={{ ...cardStyle, marginBottom: 30 }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#222' }}>
          Niche or URL
        </label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setPreviewCaption('');
            }}
            placeholder="e.g. organic dog treats  --or--  https://example.com/article"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 14,
              color: '#222',
            }}
          />
          <button
            onClick={handlePreview}
            disabled={previewing || !inputValue.trim()}
            style={{
              ...btnStyle,
              background: previewing || !inputValue.trim() ? '#999' : '#0070f3',
              cursor: previewing || !inputValue.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {previewing ? 'Generating...' : 'Preview'}
          </button>
        </div>
        {inputValue.trim() && (
          <p style={{ fontSize: 12, color: '#666', marginTop: -4, marginBottom: 10 }}>
            Detected as: <strong>{inputType === 'url' ? 'URL' : 'Niche/topic'}</strong>
          </p>
        )}

        {previewCaption && (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginTop: 10, marginBottom: 6, color: '#222' }}>
              Preview -- tweak before scheduling
            </label>
            <textarea
              value={previewCaption}
              onChange={(e) => setPreviewCaption(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                fontFamily: 'inherit',
                fontSize: 14,
                color: '#222',
                padding: 10,
                borderRadius: 6,
                border: '1px solid #ccc',
                resize: 'vertical',
                boxSizing: 'border-box',
                marginBottom: 12,
              }}
            />
            <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
              This preview just confirms the tone. Each scheduled run generates a fresh post based
              on this {inputType === 'url' ? 'URL' : 'niche'} -- it won't repeat the same text every time.
            </p>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  fontSize: 14,
                  color: '#222',
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <button
                onClick={handleSaveSchedule}
                disabled={saving}
                style={{
                  ...btnStyle,
                  background: '#16a34a',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Schedule It'}
              </button>
            </div>
          </>
        )}
      </div>

      {error && <p style={{ color: '#ff8080', marginBottom: 20 }}>{error}</p>}

      {loading ? (
        <p style={{ color: '#ddd' }}>Loading...</p>
      ) : schedules.length === 0 ? (
        <p style={{ color: '#ddd' }}>No schedules yet. Add one above to start auto-posting.</p>
      ) : (
        schedules.map((s) => (
          <div key={s.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 15, color: '#222' }}>{s.input_value}</strong>
                <span style={{ marginLeft: 10, fontSize: 11, color: '#888', textTransform: 'uppercase' }}>
                  {s.input_type}
                </span>
                <span style={{ marginLeft: 10, fontSize: 12, color: '#666', textTransform: 'capitalize' }}>
                  {s.frequency}
                </span>
                <span
                  style={{
                    marginLeft: 10,
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: s.active ? '#dcfce7' : '#f3f4f6',
                    color: s.active ? '#166534' : '#6b7280',
                  }}
                >
                  {s.active ? 'Active' : 'Paused'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleToggle(s.id, s.active)}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #ccc',
                    background: '#fafafa',
                    color: '#222',
                    cursor: 'pointer',
                  }}
                >
                  {s.active ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
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
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
              Next run: {formatDate(s.next_run_at)}
              {s.last_run_at && (
                <>
                  {' · '}Last run: {formatDate(s.last_run_at)} (
                  <span style={{ color: s.last_status === 'success' ? '#16a34a' : '#dc2626' }}>
                    {s.last_status}
                  </span>
                  )
                </>
              )}
            </div>
            {s.last_caption && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#333', whiteSpace: 'pre-wrap', borderTop: '1px solid #eee', paddingTop: 8 }}>
                {s.last_caption}
              </div>
            )}
            {s.last_error && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>{s.last_error}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
