import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

  console.log("ProtectedRoute check:", isLoggedIn) // for debugging

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />; // send back to login
  }

  return children;
}