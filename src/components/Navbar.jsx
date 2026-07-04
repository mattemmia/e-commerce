import { useNavigate } from 'react-router-dom';
import { useUserRole } from './useUserRole';
import ThemeToggle from './ThemeToggle';
import { HomeIcon, ShoppingBagIcon} from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid } from '@heroicons/react/24/solid';

const Navbar = () => {
  const navigate = useNavigate();
  const { role, loading } = useUserRole();
  const isAdmin = role === 'admin';

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
          
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">



          <div className="ml-1 h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

          <ThemeToggle />

          <button className="ml-1 rounded-full p-1.5 text-zinc-600 dark:text-zinc-300
                             transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">
           
          </button>
        </div>
      </div>
    </nav>
  );

  function handleOrdersClick() {
    if (loading) return;
    navigate(isAdmin ? '/admin/orders' : '/my-orders');
  }
};

export default Navbar;