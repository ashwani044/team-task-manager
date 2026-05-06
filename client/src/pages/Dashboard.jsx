import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projectsRes = await api.get('/projects');
      setProjects(projectsRes.data);

      // fetch tasks from all projects
      const allTasks = [];
      for (const project of projectsRes.data) {
        const tasksRes = await api.get(`/tasks?project_id=${project.id}`);
        allTasks.push(...tasksRes.data);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = {
        total: allTasks.length,
        todo: allTasks.filter(t => t.status === 'todo').length,
        inProgress: allTasks.filter(t => t.status === 'in-progress').length,
        done: allTasks.filter(t => t.status === 'done').length,
        overdue: allTasks.filter(t => {
          if (!t.due_date || t.status === 'done') return false;
          return new Date(t.due_date) < today;
        }).length,
      };

      setStats(stats);
      setRecentTasks(allTasks.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const map = {
      'todo': { background: '#f5f5f0', color: '#666' },
      'in-progress': { background: '#fff8e6', color: '#b07d00' },
      'done': { background: '#f0faf0', color: '#2d7a2d' },
    };
    return map[status] || map['todo'];
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={styles.subheading}>Here's what's happening with your projects.</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => navigate('/projects')}>
          View Projects →
        </button>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid} className="stats-grid">
        <StatCard label="Total Tasks" value={stats.total} color="#1a1a1a" />
        <StatCard label="To Do" value={stats.todo} color="#666" />
        <StatCard label="In Progress" value={stats.inProgress} color="#b07d00" />
        <StatCard label="Completed" value={stats.done} color="#2d7a2d" />
        <StatCard label="Overdue" value={stats.overdue} color="#cc0000" />
      </div>

      <div style={styles.bottom} className="bottom">
        {/* Recent Tasks */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <p style={styles.empty}>No tasks yet. Create a project and add tasks!</p>
          ) : (
            <div style={styles.taskList}>
              {recentTasks.map(task => (
                <div key={task.id} style={styles.taskItem}>
                  <div>
                    <p style={styles.taskTitle}>{task.title}</p>
                    <p style={styles.taskDue}>
                      {task.due_date
                        ? `Due: ${new Date(task.due_date).toLocaleDateString()}`
                        : 'No due date'}
                    </p>
                  </div>
                  <span style={{ ...styles.badge, ...getStatusStyle(task.status) }}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects List */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Projects</h2>
          {projects.length === 0 ? (
            <p style={styles.empty}>No projects yet.</p>
          ) : (
            <div style={styles.taskList}>
              {projects.map(project => (
                <div
                  key={project.id}
                  style={{ ...styles.taskItem, cursor: 'pointer' }}
                  onClick={() => navigate(`/projects/${project.id}/tasks`)}
                >
                  <div>
                    <p style={styles.taskTitle}>{project.name}</p>
                    <p style={styles.taskDue}>{project.description}</p>
                  </div>
                  <span style={styles.arrow}>→</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#fff',
    border: '1px solid #e8e8e0',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '0.5rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 500,
    fontFamily: "'DM Serif Display', serif",
  },
  bottom: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  section: {
    background: '#fff',
    border: '1px solid #e8e8e0',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  sectionTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.2rem',
    fontWeight: 400,
    marginBottom: '1rem',
    color: '#1a1a1a',
  },
  empty: {
    fontSize: '13px',
    color: '#aaa',
    textAlign: 'center',
    padding: '2rem 0',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: '#fafaf8',
    borderRadius: '8px',
    border: '1px solid #f0f0e8',
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1a1a1a',
    marginBottom: '2px',
  },
  taskDue: {
    fontSize: '12px',
    color: '#aaa',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: '20px',
    textTransform: 'capitalize',
  },
  arrow: {
    color: '#aaa',
    fontSize: '1rem',
  },
};