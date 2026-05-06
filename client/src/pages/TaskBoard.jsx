import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#666', bg: '#f5f5f0' },
  { key: 'in-progress', label: 'In Progress', color: '#b07d00', bg: '#fff8e6' },
  { key: 'done', label: 'Done', color: '#2d7a2d', bg: '#f0faf0' },
];

export default function TaskBoard() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', due_date: '', assigned_to: '', status: 'todo'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [projectId]);

  const fetchAll = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.get('/projects'),
        api.get(`/tasks?project_id=${projectId}`),
      ]);
      const found = projectsRes.data.find(p => p.id === parseInt(projectId));
      setProject(found);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', due_date: '', assigned_to: '', status: 'todo' });
    setShowForm(true);
    setError('');
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      assigned_to: task.assigned_to || '',
      status: task.status,
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        project_id: projectId,
        assigned_to: form.assigned_to || null,
      };
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setShowForm(false);
      setEditingTask(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        status: newStatus,
        due_date: task.due_date ? task.due_date.split('T')[0] : null,
        assigned_to: task.assigned_to,
      });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>{project?.name || 'Task Board'}</h1>
          <p style={styles.subheading}>{project?.description || ''}</p>
        </div>
        <button style={styles.primaryBtn} onClick={openCreateForm}>
          + New Task
        </button>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                style={styles.closeBtn}
                onClick={() => setShowForm(false)}
              >✕</button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Task Title</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Design login page"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Optional details..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Due Date</label>
                  <input
                    style={styles.input}
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                  />
                </div>

                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Status</label>
                  <select
                    style={styles.input}
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Assigned To (User ID)</label>
                <input
                  style={styles.input}
                  placeholder="Enter user ID (optional)"
                  type="number"
                  value={form.assigned_to}
                  onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                />
              </div>

              <div style={styles.formBtns}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.primaryBtn}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div style={styles.board} className="board">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} style={styles.column}>
              <div style={styles.colHeader}>
                <div style={styles.colLeft}>
                  <span style={{
                    ...styles.colDot,
                    background: col.color
                  }} />
                  <h3 style={{ ...styles.colTitle, color: col.color }}>
                    {col.label}
                  </h3>
                </div>
                <span style={styles.colCount}>{colTasks.length}</span>
              </div>

              <div style={styles.taskList}>
                {colTasks.length === 0 && (
                  <p style={styles.emptyCol}>No tasks here</p>
                )}
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      ...styles.taskCard,
                      borderLeft: `3px solid ${isOverdue(task) ? '#cc0000' : col.color}`,
                    }}
                  >
                    {isOverdue(task) && (
                      <span style={styles.overdueBadge}>⚠ Overdue</span>
                    )}

                    <p style={styles.taskTitle}>{task.title}</p>

                    {task.description && (
                      <p style={styles.taskDesc}>{task.description}</p>
                    )}

                    <div style={styles.taskMeta}>
                      {task.due_date && (
                        <span style={styles.metaItem}>
                          📅 {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.assigned_to_name && (
                        <span style={styles.metaItem}>
                          👤 {task.assigned_to_name}
                        </span>
                      )}
                    </div>

                    {/* Quick status move buttons */}
                    <div style={styles.taskActions}>
                      {col.key !== 'todo' && (
                        <button
                          style={styles.moveBtn}
                          onClick={() => handleStatusChange(
                            task,
                            col.key === 'done' ? 'in-progress' : 'todo'
                          )}
                        >← Back</button>
                      )}
                      {col.key !== 'done' && (
                        <button
                          style={styles.moveBtn}
                          onClick={() => handleStatusChange(
                            task,
                            col.key === 'todo' ? 'in-progress' : 'done'
                          )}
                        >Next →</button>
                      )}
                      <button
                        style={styles.editBtn}
                        onClick={() => openEditForm(task)}
                      >Edit</button>
                      {user?.role === 'Admin' && (
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(task.id)}
                        >✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1200px',
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
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '500px',
    margin: '1rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.4rem',
    fontWeight: 400,
    color: '#1a1a1a',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#888',
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
  row: {
    display: 'flex',
    gap: '1rem',
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
  formBtns: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    marginTop: '0.5rem',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid #e0e0d8',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    color: '#666',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem',
    alignItems: 'start',
  },
  column: {
    background: '#fafaf8',
    borderRadius: '12px',
    border: '1px solid #e8e8e0',
    padding: '1rem',
  },
  colHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  colLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  colDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  colTitle: {
    fontSize: '13px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  colCount: {
    fontSize: '12px',
    color: '#aaa',
    background: '#fff',
    border: '1px solid #e8e8e0',
    borderRadius: '20px',
    padding: '2px 8px',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  emptyCol: {
    fontSize: '13px',
    color: '#ccc',
    textAlign: 'center',
    padding: '1.5rem 0',
  },
  taskCard: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e8e8e0',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  overdueBadge: {
    fontSize: '11px',
    color: '#cc0000',
    fontWeight: 500,
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1a1a1a',
    lineHeight: 1.4,
  },
  taskDesc: {
    fontSize: '12px',
    color: '#888',
    lineHeight: 1.5,
  },
  taskMeta: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: '11px',
    color: '#aaa',
  },
  taskActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.25rem',
    flexWrap: 'wrap',
  },
  moveBtn: {
    padding: '4px 10px',
    background: '#f5f5f0',
    border: '1px solid #e8e8e0',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    color: '#444',
  },
  editBtn: {
    padding: '4px 10px',
    background: '#f5f5f0',
    border: '1px solid #e8e8e0',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    color: '#444',
  },
  deleteBtn: {
    padding: '4px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    color: '#ccc',
    marginLeft: 'auto',
  },
};