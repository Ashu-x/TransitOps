import { useState, useEffect } from 'react';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';
import { UserPlus } from 'lucide-react';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchDrivers();
  }, []);

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
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} /> 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Management</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <UserPlus size={18} />
          Add Driver
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <DataTable columns={columns} data={drivers} isLoading={isLoading} />
    </div>
  );
};

export default Drivers;