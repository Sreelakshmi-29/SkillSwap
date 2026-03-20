import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link 
          to={isAuthenticated ? '/dashboard' : '/'} 
          className="text-xl font-bold text-gray-900 dark:text-white"
        >
          Skill<span className="text-sky-500">Swap</span>
        </Link>

        <div className="flex items-center gap-4">

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-4">
              <Link 
                to="/matches" 
                className="text-gray-600 dark:text-gray-300 hover:text-sky-500 transition-colors"
              >
                Matches
              </Link>

              <Link 
                to="/chat" 
                className="text-gray-600 dark:text-gray-300 hover:text-sky-500 transition-colors"
              >
                Chat
              </Link>

              <Link 
                to="/skills" 
                className="text-gray-600 dark:text-gray-300 hover:text-sky-500 transition-colors"
              >
                Skills
              </Link>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff`
                  }
                  alt={user?.name}
                  className="w-9 h-9 rounded-full border-2 border-sky-200 hover:border-sky-500 transition-colors cursor-pointer"
                />
              </Link>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium"
            >
              Login
            </a>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;