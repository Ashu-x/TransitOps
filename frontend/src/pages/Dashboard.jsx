import { useState, useEffect } from 'react';
import { Truck, AlertTriangle, Route, Activity } from 'lucide-react';
import { api } from '../services/api';

const StatCard = ({ title, value, icon: Icon, colorClass, isLoading }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center gap-4 transition-colors">
    <div className={`p-4 rounded-lg ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      {isLoading ? (
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
      ) : (
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeVehicles: 0,
    inMaintenance: 0,
    activeTrips: 0,
    utilization: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await api.getDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError("Failed to load dashboard statistics.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fleet Overview</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Dynamic KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Vehicles" 
          value={stats.activeVehicles} 
          icon={Truck} 
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          isLoading={isLoading} 
        />
        <StatCard 
          title="In Maintenance" 
          value={stats.inMaintenance} 
          icon={AlertTriangle} 
          colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          isLoading={isLoading} 
        />
        <StatCard 
          title="Active Trips" 
          value={stats.activeTrips} 
          icon={Route} 
          colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          isLoading={isLoading} 
        />
        <StatCard 
          title="Fleet Utilization" 
          value={`${stats.utilization}%`} 
          icon={Activity} 
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          isLoading={isLoading} 
        />
      </div>

      {/* Main Content Area Placeholder */}
      <div className="bg-white dark:bg-gray-900 h-96 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center transition-colors">
        <p className="text-gray-500 dark:text-gray-400">Activity Chart Placeholder</p>
      </div>
    </div>
  );
};

export default Dashboard;