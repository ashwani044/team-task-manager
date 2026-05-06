import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!token) return <Navigate to="/auth" />;

  return children;
};

export default ProtectedRoute;