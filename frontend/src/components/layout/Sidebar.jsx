import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Route as RouteIcon, Wrench, Droplet } from 'lucide-react';
// IMPORT the AuthContext so we know who is logged in!
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth(); // Get the current user

  // We add an 'allowedRoles' array to every navigation item
  const navItems = [
    { 
      name: 'Dashboard', path: '/', icon: LayoutDashboard, 
      allowedRoles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] 
    },
    { 
      name: 'Vehicles', path: '/vehicles', icon: Truck, 
      allowedRoles: ['FLEET_MANAGER'] 
    },
    { 
      name: 'Drivers', path: '/drivers', icon: Users, 
      allowedRoles: ['FLEET_MANAGER', 'SAFETY_OFFICER'] 
    },
    { 
      name: 'Trips', path: '/trips', icon: RouteIcon, 
      allowedRoles: ['FLEET_MANAGER', 'DRIVER'] 
    },
    { 
      name: 'Maintenance', path: '/maintenance', icon: Wrench, 
      allowedRoles: ['FLEET_MANAGER'] 
    },
    { 
      name: 'Fuel & Expenses', path: '/fuel', icon: Droplet, 
      allowedRoles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'] 
    },
  ];

  // Filter the list so users only see buttons they are allowed to click
  const visibleNavItems = navItems.filter(item => 
    !user || item.allowedRoles.includes(user.role)
  );

  return (
    <div className="w-64 bg-gray-900 dark:bg-[#111111] min-h-screen text-white flex flex-col transition-colors duration-200 border-r border-gray-800">
      
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-lg shadow-sm">
            TO
          </div>
          <span className="font-bold text-xl tracking-wide">TransitOps</span>
        </div>
      </div>

      {/* Dynamic Navigation Menu */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon 
                size={20} 
                className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'}`} 
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Branding Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Logged in as</p>
          <p className="text-sm font-bold text-blue-400 mt-1 capitalize">
            {user?.role?.replace('_', ' ').toLowerCase() || 'Guest'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;