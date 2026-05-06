import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Projects</h1>
          <p style={styles.subheading}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>
        {user?.role === 'Admin' && (
          <button
            style={styles.primaryBtn}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancel' : '+ New Project'}
          </button>
        )}
      </div>

      {/* Create Project Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Create a new project</h2>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Project Name</label>
              <input
                style={styles.input}
                placeholder="e.g. Marketing Website"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, resize: 'vertical', minHeight: '80px' }}
                placeholder="What is this project about?"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <button style={styles.primaryBtn} type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Project →'}
            </button>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>No projects yet</p>
          <p style={styles.emptyText}>
            {user?.role === 'Admin'
              ? 'Click "New Project" to create your first one.'
              : 'Ask an Admin to create a project and add you.'}
          </p>
        </div>
      ) : (
        <div style={styles.grid} className="projects-grid">
          {projects.map(project => (
            <div key={project.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.cardIcon}>
                  {project.name.charAt(0).toUpperCase()}
                </div>
                {user?.role === 'Admin' && (
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(project.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
              <h3 style={styles.cardTitle}>{project.name}</h3>
              <p style={styles.cardDesc}>
                {project.description || 'No description provided.'}
              </p>
              <button
                style={styles.viewBtn}
                onClick={() => navigate(`/projects/${project.id}/tasks`)}
              >
                View Tasks →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '2rem',
    fontWeight: 400,
    color: '#1a1a1a',
    marginBottom: '0.25rem',
  },
  subheading: {
    fontSize: '14px',
    color: '#888',
  },
  primaryBtn: {
    padding: '10px 20px',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  formCard: {
    background: '#fff',
    border: '1px solid #e8e8e0',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  formTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.2rem',
    fontWeight: 400,
    marginBottom: '1rem',
    color: '#1a1a1a',
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
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e8e8e0',
  },
  emptyTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.5rem',
    color: '#1a1a1a',
    marginBottom: '0.5rem',
  },
  emptyText: {
    fontSize: '14px',
    color: '#888',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    background: '#fff',
    border: '1px solid #e8e8e0',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#1a1a1a',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontFamily: "'DM Serif Display', serif",
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px 8px',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#1a1a1a',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#888',
    lineHeight: 1.5,
    flex: 1,
  },
  viewBtn: {
    padding: '8px 16px',
    background: '#f5f5f0',
    border: '1px solid #e8e8e0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    color: '#1a1a1a',
    textAlign: 'left',
  },
};