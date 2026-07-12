import { useState, useEffect, useMemo } from 'react';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';
import { Wrench, Search, ChevronUp, ChevronDown } from 'lucide-react';

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ vehicleId: '', description: '', cost: '' });

  // Data Processing State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch all required data from the backend
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [logsRes, vehiclesRes] = await Promise.all([
        api.getAllMaintenance(),
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

  // Filter and Sort Logic
  const processedData = useMemo(() => {
    let filtered = logs.filter(log => 
      log.vehicle.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'vehicleReg') {
        aVal = a.vehicle.registrationNo;
        bVal = b.vehicle.registrationNo;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [logs, searchTerm, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedLogs = processedData.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // The Create Log Logic
  const handleCreateLog = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.logMaintenance({
        vehicleId: formData.vehicleId,
        description: formData.description,
        cost: Number(formData.cost)
      });
      setShowForm(false);
      setFormData({ vehicleId: '', description: '', cost: '' });
      fetchData(); // Refresh the table automatically
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // The "Mark Completed" Button Logic
  const handleCloseLog = async (logId) => {
    try {
      setError(null); // Clear any previous errors
      await api.closeMaintenance(logId);
      fetchData(); // This is the crucial step! It pulls fresh data, removing the closed log.
    } catch (err) {
      setError(err.message);
    }
  };

  const SortableHeader = ({ label, sortKey }) => (
    <button 
      onClick={() => handleSort(sortKey)}
      className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 font-medium tracking-wider uppercase"
    >
      {label}
      {sortConfig.key === sortKey && (
        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
      )}
    </button>
  );

const columns = [
    { header: <SortableHeader label="Vehicle" sortKey="vehicleReg" />, render: (row) => `${row.vehicle.registrationNo} - ${row.vehicle.modelName}` },
    { header: <SortableHeader label="Description" sortKey="description" />, accessor: 'description' },
    { header: <SortableHeader label="Cost" sortKey="cost" />, render: (row) => `$${row.cost.toFixed(2)}` },
    { header: <SortableHeader label="Date" sortKey="date" />, render: (row) => new Date(row.date).toLocaleDateString() },
    
    // NEW: Show if the maintenance job is done or ongoing
    { 
      header: 'Job Status', 
      render: (row) => row.isClosed 
        ? <span className="text-gray-500 dark:text-gray-400 font-medium">Completed</span> 
        : <span className="text-red-600 dark:text-red-400 font-bold animate-pulse">In Shop</span> 
    },
    
    // UPDATED: Only show the button if the record is still open!
    {
      header: 'Actions',
      render: (row) => (
        row.isClosed ? (
          <span className="text-sm text-green-400 dark:text-green-600">Resolved</span>
        ) : (
          <button 
            onClick={() => handleCloseLog(row.id)}
            className="text-sm bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-800/50 dark:text-green-400 px-3 py-1 rounded transition-colors"
          >
            Mark Completed
          </button>
        )
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

      <div className="flex bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm w-full md:w-1/3">
        <div className="flex items-center pl-2 text-gray-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search by registration or issue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500"
        />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
           <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Send Vehicle to Shop</h2>
           <form onSubmit={handleCreateLog} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Vehicle</label>
               <select required className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" onChange={e => setFormData({...formData, vehicleId: e.target.value})} value={formData.vehicleId}>
                 <option value="">-- Choose --</option>
                 {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNo} - {v.modelName}</option>)}
               </select>
             </div>
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Description</label>
               <input type="text" required placeholder="e.g. Engine Oil Change" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" onChange={e => setFormData({...formData, description: e.target.value})} value={formData.description} />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost ($)</label>
               <input type="number" required min="0" placeholder="0.00" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" onChange={e => setFormData({...formData, cost: e.target.value})} value={formData.cost} />
             </div>
             <button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors col-span-1 md:col-span-4 mt-2 disabled:opacity-50">
               {isSubmitting ? 'Submitting...' : 'Submit to Shop'}
             </button>
           </form>
        </div>
      )}

      <DataTable 
        columns={columns} 
        data={paginatedLogs} 
        isLoading={isLoading} 
        pagination={{
          currentPage,
          totalPages,
          totalItems: processedData.length,
          onNext: () => setCurrentPage(p => Math.min(p + 1, totalPages)),
          onPrev: () => setCurrentPage(p => Math.max(p - 1, 1))
        }}
      />
    </div>
  );
};

export default Maintenance;