import { useState, useEffect } from 'react';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';
import { Wrench } from 'lucide-react';

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State for new log
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ vehicleId: '', description: '', cost: '' });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch both the active logs AND vehicles that are currently AVAILABLE to put into the shop
      const [logsRes, vehiclesRes] = await Promise.all([
        api.getActiveMaintenance(),
        api.getAvailableVehicles()
      ]);
      setLogs(logsRes.data);
      setAvailableVehicles(vehiclesRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLog = async (e) => {
    e.preventDefault();
    try {
      await api.logMaintenance({
        vehicleId: formData.vehicleId,
        description: formData.description,
        cost: Number(formData.cost)
      });
      setShowForm(false);
      setFormData({ vehicleId: '', description: '', cost: '' });
      fetchData(); // Refresh data to see the new log
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseLog = async (logId) => {
    try {
      await api.closeMaintenance(logId);
      fetchData(); // Refresh data to remove the closed log and update vehicle status
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    { header: 'Vehicle', render: (row) => `${row.vehicle.registrationNo} - ${row.vehicle.modelName}` },
    { header: 'Description', accessor: 'description' },
    { header: 'Cost', render: (row) => `$${row.cost.toFixed(2)}` },
    { header: 'Date Logged', render: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Vehicle Status', render: (row) => <StatusBadge status={row.vehicle.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <button 
          onClick={() => handleCloseLog(row.id)}
          className="text-sm bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-800/50 dark:text-green-400 px-3 py-1 rounded transition-colors"
        >
          Mark Completed
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Bay</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Wrench size={18} />
          {showForm ? 'Cancel' : 'Log Maintenance'}
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>}

      {showForm && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Send Vehicle to Shop</h2>
          <form onSubmit={handleCreateLog} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Vehicle</label>
              <select 
                required
                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                value={formData.vehicleId}
              >
                <option value="">-- Choose --</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.registrationNo} - {v.modelName}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Description</label>
              <input 
                type="text" required placeholder="e.g. Engine Oil Change"
                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                onChange={e => setFormData({...formData, description: e.target.value})}
                value={formData.description}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost ($)</label>
              <input 
                type="number" required min="0" placeholder="0.00"
                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                onChange={e => setFormData({...formData, cost: e.target.value})}
                value={formData.cost}
              />
            </div>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors col-span-1 md:col-span-4 mt-2">
              Submit to Shop
            </button>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={logs} isLoading={isLoading} />
    </div>
  );
};

export default Maintenance;