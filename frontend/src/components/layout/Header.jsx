import { LogOut, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 transition-colors duration-200">
      <div className="text-xl font-semibold text-gray-900 dark:text-white">
        {/* Dynamic page title placeholder */}
      </div>
      
      <div className="flex items-center gap-6">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <User size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.email || 'Guest User'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {/* Replaces underscores with spaces and capitalizes normally (e.g., 'FLEET_MANAGER' -> 'Fleet manager') */}
              {user?.role?.replace('_', ' ').toLowerCase() || 'No Role'}
            </span>
          </div>
        </div>
        
        {/* Logout Button */}
        <button 
          onClick={logout}
          className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;