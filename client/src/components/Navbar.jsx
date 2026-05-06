import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav style={styles.nav} className="navbar">
      <Link to="/" style={styles.brand}>TaskFlow</Link>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Dashboard</Link>
        <Link to="/projects" style={styles.link}>Projects</Link>
      </div>

      <div style={styles.right}>
        <span style={styles.userBadge}>
          {user?.role === 'Admin' ? '👑' : '👤'} {user?.name}
        </span>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 2rem',
  background: '#fff',
  borderBottom: '1px solid #e8e8e0',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  flexWrap: 'wrap',
  gap: '0.5rem',
},
  brand: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.4rem',
    color: '#1a1a1a',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '2rem',
  },
  link: {
    textDecoration: 'none',
    color: '#666',
    fontSize: '14px',
    fontWeight: 500,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userBadge: {
    fontSize: '13px',
    color: '#444',
    background: '#f5f5f0',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid #e8e8e0',
  },
  logoutBtn: {
    padding: '6px 16px',
    background: 'transparent',
    border: '1px solid #e8e8e0',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    color: '#666',
  },
};