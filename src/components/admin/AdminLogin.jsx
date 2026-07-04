




import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' }); // 'error' | 'loading'
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus({ type: 'loading', message: '' });
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      navigate('/admin');
    } catch (err) {
  let message = 'Login failed. Try again.';
  if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
    message = 'Invalid email or password';
  } else if (err.code === 'auth/too-many-requests') {
    message = 'Too many attempts. Try again later.';
  } else if (err.code === 'permission-denied') { // ADD THIS
    message = 'Access denied. Check Firestore rules.';
  }
  setStatus({ type: 'error', message });
  console.error(err) // so you can see it
}};



  const inputBase = "w-full p-3.5 rounded-lg border-2 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-4 transition";
  const inputNormal = "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100";
  const inputError = "border-red-500 focus:border-red-500 focus:ring-red-100";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-5">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl">

        <h2 className="text-3xl font-bold text-center text-black mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 text-sm mb-8">Login to your admin panel</p>

        {status.type === 'error' && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-5 border-red-200 text-sm">
            <AlertCircle size={18} />
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className={`${inputBase} ${errors.password ? inputError : inputNormal}`}
              autoComplete="current-password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={status.type === 'loading'}
            className="w-full flex items-center justify-center gap-2 p-3.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-500/30"
          >
            {status.type === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            {status.type === 'loading' ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Back to <Link to="/" className="text-indigo-600 font-semibold hover:underline">Shop</Link>
        </p>
      </div>
    </div>
  );
}