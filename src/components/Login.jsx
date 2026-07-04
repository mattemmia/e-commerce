import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2, AlertCircle, Info } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' }); // 'error' | 'loading'
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus({ type: 'loading', message: '' });
    
    // DEMO MODE: Skip Firebase Auth. Just fake login
    setTimeout(() => {
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('adminUser', form.email);
      navigate('/admin'); // or /admin/stock
    }, 800); // fake loading delay so it feels real
  };

  const inputBase = "w-full p-3.5 rounded-lg border-2 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-4 transition";
  const inputNormal = "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100";
  const inputError = "border-red-500 focus:border-red-500 focus:ring-red-100";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-5 relative">
      
      {/* FLOATING COMMENT */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-yellow-100 border-yellow-300 text-yellow-800 px-4 py-2 rounded-xl shadow-lg animate-bounce z-50">
        <Info size={18} />
        <span className="text-sm font-semibold">Use ANY email + password to test</span>
      </div>

      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl">

        <h2 className="text-3xl font-bold text-center text-black mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 text-sm mb-8">Login to Admin Demo Panel</p>

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
              placeholder="recruiter@demo.com"
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
              placeholder="Enter any password"
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

        <p className="mt-6 text-center text-xs text-gray-400">
          *Demo Mode: Any credentials will work*
        </p>

        <p className="mt-2 text-center text-sm text-gray-600">
          Back to <Link to="/" className="text-indigo-600 font-semibold hover:underline">Shop</Link>
        </p>
      </div>
    </div>
  );
}