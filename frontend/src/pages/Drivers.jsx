import { useState, useEffect } from 'react';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';
import { UserPlus, X } from 'lucide-react';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseCategory: 'C', // Default to standard commercial
    licenseExpiry: '',
    contactNumber: ''
  });

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDrivers();
      setDrivers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
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
      
      // Prisma expects a valid Date format for DateTime fields
      await api.createDriver({
        ...formData,
        licenseExpiry: new Date(formData.licenseExpiry).toISOString()
      });

      // Reset form and refresh table
      setShowForm(false);
      setFormData({ name: '', licenseNumber: '', licenseCategory: 'C', licenseExpiry: '', contactNumber: '' });
      fetchDrivers();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'License No', accessor: 'licenseNumber' },
    { header: 'Category', accessor: 'licenseCategory' },
    { 
      header: 'Safety Score', 
      accessor: 'safetyScore',
      render: (row) => (
        <span className={`font-semibold ${row.safetyScore >= 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
          {row.safetyScore}/100
        </span>
      )
    },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Management</h1>
        
        {/* Toggle Form Button */}
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-white ${
            showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {showForm ? <X size={18} /> : <UserPlus size={18} />}
          {showForm ? 'Cancel' : 'Add Driver'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* The Add Driver Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Register New Driver</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Alex Johnson" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License Number</label>
              <input type="text" name="licenseNumber" required value={formData.licenseNumber} onChange={handleChange} placeholder="e.g. D12345678" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License Category</label>
              <select name="licenseCategory" value={formData.licenseCategory} onChange={handleChange} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white">
                <option value="B">B (Light Vehicles)</option>
                <option value="C">C (Heavy Goods)</option>
                <option value="CE">CE (Heavy + Trailer)</option>
                <option value="D">D (Passenger)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License Expiry Date</label>
              <input type="date" name="licenseExpiry" required value={formData.licenseExpiry} onChange={handleChange} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
              <input type="text" name="contactNumber" required value={formData.contactNumber} onChange={handleChange} placeholder="e.g. +1 555-0123" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" />
            </div>

            <div className="md:col-span-3 flex justify-end mt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Driver'}
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={drivers} isLoading={isLoading} />
    </div>
  );
};

export default Drivers;