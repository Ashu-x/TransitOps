import { useState, useEffect } from 'react';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../services/api';
import { Plus } from 'lucide-react';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data when the component mounts
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

    fetchVehicles();
  }, []);

  // Define how the DataTable should render the columns based on your Prisma schema
  const columns = [
    { header: 'Registration No', accessor: 'registrationNo' },
    { header: 'Model', accessor: 'modelName' },
    { header: 'Type', accessor: 'type' },
    { 
      header: 'Capacity', 
      accessor: 'maxCapacity',
      render: (row) => `${row.maxCapacity} kg` 
    },
    { 
      header: 'Odometer', 
      accessor: 'odometer',
      render: (row) => `${row.odometer.toLocaleString()} km` 
    },
    { 
      header: 'Status', 
      accessor: 'status',
      // We use the StatusBadge component we built for this column!
      render: (row) => <StatusBadge status={row.status} /> 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Registry</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <DataTable columns={columns} data={vehicles} isLoading={isLoading} />
    </div>
  );
};

export default Vehicles;