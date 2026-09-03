// components/EmailSignup.jsx
import React, { useState } from 'react';

export default function EmailSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          preferences: {
            reportFrequency: 'weekly',
            notifications: true,
            digest: true,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage('✅ Successfully subscribed! Check your email.');
        setEmail('');
        setName('');
      } else {
        setMessage(`❌ ${data.error || 'Failed to subscribe'}`);
      }
    } catch (error) {
      setMessage('❌ Error subscribing. Please try again.');
      console.error('Subscribe error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3 style={styles.title}>📧 Get Competitor Reports</h3>
        <p style={styles.subtitle}>
          Stay updated with weekly competitor analysis and alerts
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>

          {message && (
            <p style={{
              ...styles.message,
              color: success ? '#22c55e' : '#ef4444',
            }}>
              {message}
            </p>
          )}
        </form>

        <div style={styles.benefits}>
          <p style={styles.benefitsTitle}>You'll get:</p>
          <ul style={styles.benefitsList}>
            <li style={styles.benefitItem}>✓ Weekly competitor reports</li>
            <li style={styles.benefitItem}>✓ Real-time price & content alerts</li>
            <li style={styles.benefitItem}>✓ Market intelligence digest</li>
            <li style={styles.benefitItem}>✓ Exclusive insights & trends</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    marginBottom: '30px',
  },
  card: {
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 20px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'transform 0.2s',
  },
  message: {
    textAlign: 'center',
    fontSize: '14px',
    marginTop: '10px',
  },
  benefits: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  benefitsTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0',
  },
  benefitsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  benefitItem: {
    fontSize: '13px',
    color: '#666',
    margin: '5px 0',
  },
};
