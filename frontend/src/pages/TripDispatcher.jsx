import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MapPin, AlertCircle, Circle, CheckCircle2, XCircle, Navigation } from 'lucide-react';

const TripDispatcher = () => {
  // --- State Management ---
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    distance: '' 
  });

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch all trips, plus ONLY vehicles and drivers that are currently AVAILABLE
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        api.getAllTrips(),
        api.getAvailableVehicles(),
        api.getAvailableDrivers()
      ]);
      
      setTrips(tripsRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load dispatch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Business Logic: Real-time Capacity Check ---
  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
  const cargoWeightNum = Number(formData.cargoWeight);
  
  // Calculate if the truck is overloaded
  const capacityExceededBy = selectedVehicle && cargoWeightNum > selectedVehicle.maxCapacity 
    ? cargoWeightNum - selectedVehicle.maxCapacity 
    : 0;
  
  const isOverweight = capacityExceededBy > 0;
  const isFormValid = formData.source && formData.destination && formData.vehicleId && formData.driverId && formData.cargoWeight && !isOverweight;

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 1. Create a new Trip
  const handleDispatch = async (e) => {
    e.preventDefault();
    if (isOverweight) return; // Failsafe
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await api.dispatchTrip({
        source: formData.source,
        destination: formData.destination,
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        cargoWeight: cargoWeightNum
      });

      // Reset form and refresh all data (Live Board, Vehicles dropdown, Drivers dropdown)
      setFormData({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', distance: '' });
      fetchData();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Update an existing Trip's Status (Complete / Cancel)
  const handleUpdateStatus = async (tripId, newStatus) => {
    try {
      setError(null);
      await api.updateTripStatus(tripId, newStatus);
      fetchData(); // This instantly pulls fresh data, moving assets back to Available!
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper function for demo ETAs
  const getDemoETA = (tripId, status) => {
    if (status === 'COMPLETED') return '--';
    if (status === 'DRAFT' || status === 'PENDING') return 'Awaiting dispatch';
    if (status === 'CANCELLED') return 'Vehicle went to shop';
    const hash = tripId.charCodeAt(0) + tripId.charCodeAt(tripId.length - 1);
    return `${(hash * 7) % 60} min`;
  };

  if (isLoading) return <div className="p-10 text-gray-500 font-medium">Loading Dispatch Center...</div>;

  return (
    <div className="max-w-[1600px] mx-auto pb-10">
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
        
        {/* =========================================
            LEFT COLUMN: CREATE TRIP FORM 
            ========================================= */}
        <div className="xl:col-span-5 space-y-8">
          
          {/* Trip Lifecycle Visualizer
          <div>
            <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Trip Lifecycle</h3>
            <div className="flex items-center justify-between relative px-2">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 -z-10"></div>
              
              <div className="flex flex-col items-center gap-2 bg-white dark:bg-[#1a1a1a] px-1">
                <Circle size={20} className="fill-green-500 text-green-500" />
                <span className="text-xs font-medium text-green-600 dark:text-green-500">Draft</span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-white dark:bg-[#1a1a1a] px-1">
                <Navigation size={20} className="fill-blue-500 text-blue-500" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-500">Dispatched</span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-white dark:bg-[#1a1a1a] px-1">
                <CheckCircle2 size={20} className="fill-gray-400 text-gray-400 dark:fill-gray-600 dark:text-gray-600" />
                <span className="text-xs font-medium text-gray-500">Completed</span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-white dark:bg-[#1a1a1a] px-1">
                <XCircle size={20} className="fill-gray-400 text-gray-400 dark:fill-gray-600 dark:text-gray-600" />
                <span className="text-xs font-medium text-gray-500">Cancelled</span>
              </div>
            </div>
          </div> */}

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Create Trip Form */}
          <form onSubmit={handleDispatch} className="space-y-5">
            <h2 className="text-lg font-bold tracking-wider text-gray-900 dark:text-white uppercase mb-2">Create Trip</h2>
            
            <div>
              <label className="block text-xs font-bold tracking-wide text-gray-500 uppercase mb-1">Source</label>
              <input type="text" name="source" required value={formData.source} onChange={handleChange} placeholder="e.g. Gandhinagar Depot" className="w-full p-2.5 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wide text-gray-500 uppercase mb-1">Destination</label>
              <input type="text" name="destination" required value={formData.destination} onChange={handleChange} placeholder="e.g. Ahmedabad Hub" className="w-full p-2.5 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wide text-gray-500 uppercase mb-1">Vehicle (Available Only)</label>
              <select name="vehicleId" required value={formData.vehicleId} onChange={handleChange} className="w-full p-2.5 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                <option value="" className="bg-white dark:bg-gray-900">-- Select Vehicle --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id} className="bg-white dark:bg-gray-900">
                    {v.registrationNo} - {v.maxCapacity} kg capacity
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wide text-gray-500 uppercase mb-1">Driver (Available Only)</label>
              <select name="driverId" required value={formData.driverId} onChange={handleChange} className="w-full p-2.5 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                <option value="" className="bg-white dark:bg-gray-900">-- Select Driver --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id} className="bg-white dark:bg-gray-900">{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wide text-gray-500 uppercase mb-1">Cargo Weight (kg)</label>
              <input type="number" name="cargoWeight" required min="1" value={formData.cargoWeight} onChange={handleChange} placeholder="e.g. 700" className="w-full p-2.5 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wide text-gray-500 uppercase mb-1">Planned Distance (km)</label>
              <input type="number" name="distance" value={formData.distance} onChange={handleChange} placeholder="e.g. 38" className="w-full p-2.5 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>

            {/* Dynamic Overweight Warning Box */}
            {isOverweight && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mt-2 flex gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div className="text-sm">
                  <p className="text-red-600 dark:text-red-400 font-medium">Vehicle Capacity: {selectedVehicle.maxCapacity} kg</p>
                  <p className="text-red-600 dark:text-red-400 font-medium">Cargo Weight: {cargoWeightNum} kg</p>
                  <p className="text-red-600 dark:text-red-400 font-bold mt-1">
                    X Capacity exceeded by {capacityExceededBy} kg — dispatch blocked
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                disabled={!isFormValid || isSubmitting}
                className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all duration-200 ${
                  isFormValid 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Dispatching...' : isFormValid ? 'Dispatch Trip' : 'Dispatch (disabled)'}
              </button>
              
              <button 
                type="button"
                onClick={() => setFormData({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', distance: '' })}
                className="px-6 font-bold text-gray-600 dark:text-red-400 bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>


        {/* =========================================
            RIGHT COLUMN: LIVE BOARD 
            ========================================= */}
        <div className="xl:col-span-7 xl:pl-8 xl:border-l border-gray-200 dark:border-gray-800 space-y-6">
          <h2 className="text-lg font-bold tracking-wider text-gray-900 dark:text-white uppercase">Live Board</h2>

          <div className="space-y-4">
            {trips.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500">
                No trips active. Create a trip to populate the Live Board.
              </div>
            ) : (
              trips.map(trip => (
                <div key={trip.id} className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-5 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group flex flex-col justify-between">
                  
                  <div>
                    {/* Top Row: ID & Assignment */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-gray-900 dark:text-gray-200">
                        TR{trip.id.substring(0, 4).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">
                        {trip.vehicle ? trip.vehicle.registrationNo : 'Unassigned'} / {trip.driver ? trip.driver.name.toUpperCase() : 'Unassigned'}
                      </span>
                    </div>

                    {/* Middle Row: Route */}
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin size={16} className="text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-800 dark:text-gray-100 truncate">
                        {trip.source} <span className="text-gray-400 mx-2">-&gt;</span> {trip.destination}
                      </span>
                    </div>
                  </div>

                  <div>
                    {/* Bottom Row: Status & ETA */}
                    <div className="flex justify-between items-end mb-3">
                      <span className={`px-4 py-1.5 rounded text-sm font-medium border ${
                        trip.status === 'COMPLETED' ? 'bg-lime-500/10 text-lime-600 dark:bg-lime-900/30 dark:text-lime-500 border-lime-500/30' : 
                        trip.status === 'CANCELLED' ? 'bg-red-500/20 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-500/30' : 
                        trip.status === 'DRAFT' || trip.status === 'PENDING' ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-400/30' : 
                        'bg-blue-500/20 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-500/30'
                      }`}>
                        {trip.status.replace('_', ' ')}
                      </span>
                      
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {getDemoETA(trip.id, trip.status)}
                      </span>
                    </div>

                    {/* Action Buttons (Only visible for active trips) */}
                    {(trip.status === 'DISPATCHED' || trip.status === 'ON_TRIP') && (
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(trip.id, 'COMPLETED')}
                          className="flex-1 bg-lime-100 hover:bg-lime-200 text-lime-700 dark:bg-lime-900/30 dark:hover:bg-lime-800/50 dark:text-lime-500 py-1.5 rounded text-sm font-bold transition-colors"
                        >
                          Mark Completed
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(trip.id, 'CANCELLED')}
                          className="px-4 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-800/50 dark:text-red-500 py-1.5 rounded text-sm font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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

export default TripDispatcher;