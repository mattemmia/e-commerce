import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from './useUserRole';
import ThemeToggle from './ThemeToggle';
import { HomeIcon, ShoppingBagIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid } from '@heroicons/react/24/solid';

const Navbar = () => {
  const navigate = useNavigate();
  const { role, loading } = useUserRole();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check localStorage on load
  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true' || role === 'admin');
  }, [role]);

  const handleDummyLogin = () => {
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('userEmail', 'admin@shopswift.com');
    setIsAdmin(true);
    navigate('/admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userEmail');
    setIsAdmin(false);
    navigate('/');
  };

  const handleOrdersClick = () => {
    if (loading) return;
    navigate(isAdmin ? '/admin/orders' : '/my-orders');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <nav className="sticky top-0 z-[100]
                    border-b border-white/10 dark:border-zinc-800/50
                    bg-white/60 dark:bg-zinc-950/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/40
                    shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left: Brand */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg
                          bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600
                          shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
            <HomeSolid className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Omonsco
          </span>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">


          {/* Dummy Admin Login/Logout */}
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white
                         transition-all hover:bg-red-600 hover:shadow-lg shadow-red-500/20">
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <button
              onClick={handleDummyLogin}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white
                         transition-all hover:bg-purple-700 hover:shadow-lg shadow-purple-500/20">
              <ShieldCheckIcon className="h-4 w-4" />
              Admin
            </button>
          )}

          <div className="ml-1 h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;