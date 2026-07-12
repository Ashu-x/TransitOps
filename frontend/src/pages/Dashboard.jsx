import { Truck, AlertTriangle, Route, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center gap-4 transition-colors">
    <div className={`p-4 rounded-lg ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fleet Overview</h1>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Vehicles" 
          value="42" 
          icon={Truck} 
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
        />
        <StatCard 
          title="In Maintenance" 
          value="5" 
          icon={AlertTriangle} 
          colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" 
        />
        <StatCard 
          title="Active Trips" 
          value="18" 
          icon={Route} 
          colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
        />
        <StatCard 
          title="Fleet Utilization" 
          value="78%" 
          icon={Activity} 
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
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