import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;
      const res = await api.post(endpoint, payload);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <h1 style={styles.brand}>TaskFlow</h1>
        <p style={styles.tagline}>Manage your team.<br />Ship faster together.</p>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</h2>
          <p style={styles.subtitle}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span style={styles.toggle} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? 'Sign up' : 'Log in'}
            </span>
          </p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLogin && (
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  name="name"
                  placeholder="Vikrant Singh"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <div style={styles.field}>
                <label style={styles.label}>Role</label>
                <select
                  style={styles.input}
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            )}

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Log in →' : 'Create account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    flexWrap: 'wrap',
  },
  left: {
    flex: '1 1 300px',
    background: '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '4rem',
  },
  brand: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '2.5rem',
    color: '#f5f5f0',
    marginBottom: '1.5rem',
  },
  tagline: {
    fontSize: '1.25rem',
    color: '#888',
    lineHeight: 1.6,
  },
  right: {
    flex: '1 1 300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#f5f5f0',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #e8e8e0',
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.75rem',
    fontWeight: 400,
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '1.5rem',
  },
  toggle: {
    color: '#1a1a1a',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  error: {
    background: '#fff0f0',
    border: '1px solid #ffcccc',
    color: '#cc0000',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#444',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e0e0d8',
    fontSize: '14px',
    background: '#fafaf8',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    width: '100%',
  },
  button: {
    marginTop: '0.5rem',
    padding: '12px',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    width: '100%',
  },
};