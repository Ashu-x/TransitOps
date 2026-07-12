import { useState, useEffect } from 'react';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';
import { Plus, X } from 'lucide-react';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    registrationNo: '',
    modelName: '',
    type: 'Van',
    maxCapacity: '',
    odometer: '',
    acquisitionCost: ''
  });

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await api.getVehicles();
      setVehicles(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert string inputs to numbers for the database
      await api.createVehicle({
        ...formData,
        maxCapacity: Number(formData.maxCapacity),
        odometer: Number(formData.odometer),
        acquisitionCost: Number(formData.acquisitionCost)
      });

      // Reset form and refresh table
      setShowForm(false);
      setFormData({ registrationNo: '', modelName: '', type: 'Van', maxCapacity: '', odometer: '', acquisitionCost: '' });
      fetchVehicles();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: 'Registration No', accessor: 'registrationNo' },
    { header: 'Model', accessor: 'modelName' },
    { header: 'Type', accessor: 'type' },
    { header: 'Capacity', accessor: 'maxCapacity', render: (row) => `${row.maxCapacity} kg` },
    { header: 'Odometer', accessor: 'odometer', render: (row) => `${row.odometer.toLocaleString()} km` },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Registry</h1>
        
        {/* Toggle Form Button */}
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-white ${
            showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Vehicle'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* The Add Vehicle Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Register New Asset</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Number</label>
              <input type="text" name="registrationNo" required value={formData.registrationNo} onChange={handleChange} placeholder="e.g. VAN-05" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model Name</label>
              <input type="text" name="modelName" required value={formData.modelName} onChange={handleChange} placeholder="e.g. Ford Transit" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white">
                <option value="Van">Van</option>
                <option value="Light Truck">Light Truck</option>
                <option value="Heavy Truck">Heavy Truck</option>
                <option value="Refrigerated">Refrigerated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Capacity (kg)</label>
              <input type="number" name="maxCapacity" required min="1" value={formData.maxCapacity} onChange={handleChange} placeholder="e.g. 500" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Odometer (km)</label>
              <input type="number" name="odometer" required min="0" value={formData.odometer} onChange={handleChange} placeholder="e.g. 15000" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Acquisition Cost ($)</label>
              <input type="number" name="acquisitionCost" required min="0" value={formData.acquisitionCost} onChange={handleChange} placeholder="e.g. 35000" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" />
            </div>

            <div className="md:col-span-3 flex justify-end mt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Vehicle'}
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={vehicles} isLoading={isLoading} />
    </div>
  );
};

export default Vehicles;