import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Route, Wrench } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Vehicles', path: '/vehicles', icon: Truck },
    { name: 'Drivers', path: '/drivers', icon: Users },
    { name: 'Trips', path: '/trips', icon: Route },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 flex flex-col h-screen border-r border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="p-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">
          TO
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">TransitOps</span>
      </div>
      
      <nav className="flex-1 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 border-r-4 border-blue-600 dark:border-blue-500' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;