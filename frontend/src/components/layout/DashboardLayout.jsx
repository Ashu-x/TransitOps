import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden font-sans bg-gray-50 dark:bg-black transition-colors duration-200">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;