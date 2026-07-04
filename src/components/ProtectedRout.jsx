import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const adminEmails = ['admin@gmail.com'];

export default function ProtectedRoute({ children }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  // Auto-logout admin users after 15 minutes of inactivity
  useEffect(() => {
    if (user && adminEmails.includes(user.email)) {
      const timer = setTimeout(() => {
        logout().then(() => {
          alert('Admin Session expired. Please log in again.');
        });
      }, 15 * 60 * 1000); // 15 minutes
      return () => clearTimeout(timer);
    }
  }, [user, logout, adminEmails]);
  console.log("loading", loading, "user", user);
  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Checking auth...</div>;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!adminEmails.includes(user.email)) {

    return <Navigate to="/" state={{ from: location }}
      replace />;
  }
  console.log("admin@gmial.com", user.email, "admin list", adminEmails)
  return children;
}