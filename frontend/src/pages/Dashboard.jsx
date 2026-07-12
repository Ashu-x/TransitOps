import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';

const Dashboard = () => {
  const [rawData, setRawData] = useState({ vehicles: [], trips: [], drivers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch all raw data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Using Promise.all to fetch everything in parallel for maximum speed
        const [vehiclesRes, tripsRes, driversRes] = await Promise.all([
          api.getVehicles(),
          api.getAllTrips(),
          api.getDrivers()
        ]);

        setRawData({
          vehicles: vehiclesRes.data,
          trips: tripsRes.data,
          drivers: driversRes.data
        });
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 2. Compute Dashboard Metrics dynamically from the raw data
  const dashboardStats = useMemo(() => {
    const { vehicles, trips, drivers } = rawData;

    // Vehicle Metrics
    const available = vehicles.filter(v => v.status === 'AVAILABLE').length;
    const onTrip = vehicles.filter(v => v.status === 'ON_TRIP' || v.status === 'DISPATCHED').length;
    const inShop = vehicles.filter(v => v.status === 'IN_SHOP').length;
    const retired = vehicles.filter(v => v.status === 'RETIRED').length;
    
    // Active vehicles = everything that isn't retired
    const activeVehicles = vehicles.length - retired;
    const utilization = activeVehicles > 0 ? Math.round((onTrip / activeVehicles) * 100) : 0;

    // Trip Metrics
    const activeTripsCount = trips.filter(t => t.status === 'DISPATCHED' || t.status === 'ON_TRIP').length;
    const pendingTripsCount = trips.filter(t => t.status === 'DRAFT' || t.status === 'PENDING').length;
    const generateDemoETA = (tripId, status) => {
      if (status === 'COMPLETED') return '--';
      if (status === 'DRAFT' || status === 'PENDING') return 'Awaiting Dispatch';
      
      // Generate a consistent pseudo-random time based on the ID string
      const hash = tripId.charCodeAt(0) + tripId.charCodeAt(tripId.length - 1);
      const hours = hash % 3; 
      const mins = (hash * 7) % 60;
      
      return hours === 0 ? `${mins} min` : `${hours}h ${mins}m`;
    };
    // Get the 5 most recent trips for the table
    const recentTripsList = trips.slice(0, 5).map(t => ({
      id: `TR${t.id.substring(0, 4).toUpperCase()}`,
      vehicle: t.vehicle?.registrationNo || '--',
      driver: t.driver?.name || '--',
      status: t.status,
      eta: generateDemoETA(t.id, t.status) 
    }));

    // Driver Metrics
    // Assuming any driver not explicitly OFF_DUTY or SUSPENDED is available or on duty
    const driversOnDuty = drivers.filter(d => d.status === 'ON_TRIP' || d.status === 'DISPATCHED' || d.status === 'AVAILABLE').length;

    // Formatting progress bars
    const totalStatusCount = activeVehicles + retired; // used for percentages
    const statusBreakdown = [
      { label: 'Available', count: available, color: 'bg-green-500', width: `${totalStatusCount ? (available/totalStatusCount)*100 : 0}%` },
      { label: 'On Trip', count: onTrip, color: 'bg-blue-500', width: `${totalStatusCount ? (onTrip/totalStatusCount)*100 : 0}%` },
      { label: 'In Shop', count: inShop, color: 'bg-amber-600', width: `${totalStatusCount ? (inShop/totalStatusCount)*100 : 0}%` },
      { label: 'Retired', count: retired, color: 'bg-red-400', width: `${totalStatusCount ? (retired/totalStatusCount)*100 : 0}%` },
    ];

    return {
      kpis: {
        activeVehicles,
        availableVehicles: available,
        inMaintenance: inShop,
        activeTrips: activeTripsCount,
        pendingTrips: pendingTripsCount,
        driversOnDuty,
        utilization
      },
      recentTrips: recentTripsList,
      statusBreakdown
    };
  }, [rawData]);


  // Helper component for KPI Cards
  const KpiCard = ({ title, value, borderColor }) => (
    <div className={`bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border-y border-r border-gray-200 dark:border-gray-800 border-l-4 ${borderColor} shadow-sm flex flex-col justify-between h-24 transition-colors`}>
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase truncate">
        {title}
      </p>
      <div className="text-2xl sm:text-3xl font-normal text-gray-900 dark:text-gray-100">
        {isLoading ? (
          <div className="h-8 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
        ) : (
          value
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10 max-w-[1600px] mx-auto">
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* 1. FILTERS ROW (UI Shell - wiring these up requires passing params to the API) */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Filters</span>
        <select className="bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 w-40 transition-colors">
          <option>Vehicle Type: All</option>
          <option>Van</option>
          <option>Truck</option>
        </select>
        <select className="bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 w-32 transition-colors">
          <option>Status: All</option>
          <option>Active</option>
          <option>In Shop</option>
        </select>
      </div>

      {/* 2. KPI CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        <KpiCard title="Active Vehicles" value={dashboardStats.kpis.activeVehicles} borderColor="border-blue-500" />
        <KpiCard title="Available Vehicles" value={dashboardStats.kpis.availableVehicles} borderColor="border-green-500" />
        <KpiCard 
          title="Vehicles In Maintenance" 
          value={dashboardStats.kpis.inMaintenance < 10 ? `0${dashboardStats.kpis.inMaintenance}` : dashboardStats.kpis.inMaintenance} 
          borderColor="border-amber-600" 
        />
        <KpiCard title="Active Trips" value={dashboardStats.kpis.activeTrips} borderColor="border-blue-500" />
        <KpiCard 
          title="Pending Trips" 
          value={dashboardStats.kpis.pendingTrips < 10 ? `0${dashboardStats.kpis.pendingTrips}` : dashboardStats.kpis.pendingTrips} 
          borderColor="border-gray-500" 
        />
        <KpiCard title="Drivers On Duty" value={dashboardStats.kpis.driversOnDuty} borderColor="border-blue-500" />
        <KpiCard title="Fleet Utilization" value={`${dashboardStats.kpis.utilization}%`} borderColor="border-green-500" />
      </div>

      {/* 3. MAIN CONTENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Recent Trips Table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold tracking-widest text-gray-900 dark:text-gray-400 uppercase">Recent Trips</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-500 uppercase border-b border-gray-300 dark:border-gray-800">
                  <th className="pb-3 pr-4">Trip</th>
                  <th className="pb-3 px-4">Vehicle</th>
                  <th className="pb-3 px-4">Driver</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">Loading recent trips...</td>
                  </tr>
                ) : dashboardStats.recentTrips.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">No recent trips found in database.</td>
                  </tr>
                ) : (
                  dashboardStats.recentTrips.map((trip) => (
                    <tr key={trip.id} className="text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors text-sm">
                      <td className="py-4 pr-4 font-medium text-gray-500">{trip.id}</td>
                      <td className="py-4 px-4">{trip.vehicle}</td>
                      <td className="py-4 px-4">{trip.driver}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded text-xs font-medium text-black ${
                          trip.status === 'COMPLETED' ? 'bg-[#7cb32b] text-white' : 
                          trip.status === 'DRAFT' || trip.status === 'PENDING' ? 'bg-gray-500 text-white' : 
                          'bg-[#52a6ff] text-white'
                        }`}>
                          {trip.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{trip.eta}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Vehicle Status Bars */}
        <div className="space-y-6 lg:pl-6 lg:border-l lg:border-gray-200 lg:dark:border-gray-800">
          <h2 className="text-sm font-bold tracking-widest text-gray-900 dark:text-gray-400 uppercase flex justify-between">
            Vehicle Status
            <span className="text-xs text-gray-400 font-normal normal-case">Live from fleet database</span>
          </h2>
          
          <div className="space-y-5 mt-2">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>)}
              </div>
            ) : (
              dashboardStats.statusBreakdown.map((status, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-700 dark:text-gray-300 flex justify-between">
                    <span>{status.label}</span>
                    <span className="font-bold">{status.count}</span>
                  </div>
                  <div className="flex-1 h-3.5 bg-gray-200 dark:bg-[#1f1f1f] rounded-sm overflow-hidden flex">
                    <div 
                      className={`h-full ${status.color} transition-all duration-1000 ease-out`} 
                      style={{ width: status.width }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;