import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ columns, data, isLoading = false, pagination }) => {
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Loading data...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        No records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200 flex flex-col">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
          <tr>
            {columns.map((col, index) => (
              <th key={index} scope="col" className="px-6 py-4">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 text-gray-900 dark:text-gray-300 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Dynamic Pagination Footer */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto bg-gray-50 dark:bg-gray-900/50">
          <span>Showing {data.length} of {pagination.totalItems} records</span>
          
          <div className="flex items-center gap-4">
            <span>Page {pagination.currentPage} of {pagination.totalPages || 1}</span>
            <div className="flex gap-2">
              <button 
                onClick={pagination.onPrev}
                disabled={pagination.currentPage === 1}
                className="p-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={pagination.onNext}
                disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                className="p-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;