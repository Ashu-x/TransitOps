import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const TripDispatcher = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data for Step 2
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    cargoWeight: '',
    vehicleId: '',
    driverId: ''
  });

  // Fetch Available Assets when entering Step 2
  useEffect(() => {
    if (step === 2) {
      Promise.all([
        api.getAvailableVehicles(),
        api.getAvailableDrivers()
      ]).then(([vehiclesRes, driversRes]) => {
        setAvailableVehicles(vehiclesRes.data);
        setAvailableDrivers(driversRes.data);
      }).catch(err => setError("Failed to fetch available assets"));
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!formData.source || !formData.destination || !formData.cargoWeight) {
      setError("Please fill in all Trip Details.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Front-end Business Rule Validation
    const selectedVehicle = availableVehicles.find(v => v.id === formData.vehicleId);
    if (selectedVehicle && Number(formData.cargoWeight) > selectedVehicle.maxCapacity) {
      setError(`Weight (${formData.cargoWeight}kg) exceeds vehicle capacity (${selectedVehicle.maxCapacity}kg).`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.dispatchTrip({
        ...formData,
        cargoWeight: Number(formData.cargoWeight)
      });
      navigate('/vehicles'); // Redirect to see the updated statuses!
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dispatch New Trip</h1>

      {/* Stepper Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
        <div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>2</div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Trip Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Location</label>
              <input type="text" name="source" value={formData.source} onChange={handleChange} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" placeholder="e.g. Warehouse A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination</label>
              <input type="text" name="destination" value={formData.destination} onChange={handleChange} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" placeholder="e.g. Port B" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cargo Weight (kg)</label>
              <input type="number" name="cargoWeight" value={formData.cargoWeight} onChange={handleChange} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" placeholder="e.g. 450" />
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">Next Step</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Asset Assignment</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Available Vehicle</label>
              <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white">
                <option value="">-- Choose Vehicle --</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNo} - {v.modelName} (Max: {v.maxCapacity}kg)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Available Driver</label>
              <select name="driverId" value={formData.driverId} onChange={handleChange} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white">
                <option value="">-- Choose Driver --</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} - Score: {d.safetyScore}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-6 py-2 rounded">Back</button>
              <button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50">
                {loading ? 'Dispatching...' : 'Dispatch Trip'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDispatcher;