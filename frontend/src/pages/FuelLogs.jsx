import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { api } from '../services/api';

const FuelLogs = () => {
  const [fuelData, setFuelData] = useState([]);
  const [tripsData, setTripsData] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Toggles
  const [activeForm, setActiveForm] = useState(null); // 'fuel', 'expense', or null
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: '', cost: '' });
  const [expenseForm, setExpenseForm] = useState({ tripId: '', tollCost: '', otherCost: '' });

  const fetchLedgerData = async () => {
    try {
      setIsLoading(true);
      
      const [fuelRes, tripsRes, maintRes, vehiclesRes] = await Promise.all([
        api.getAllFuelLogs(),
        api.getAllTrips(),
        api.getAllMaintenance(),
        api.getVehicles() // Fetching all vehicles for the fuel dropdown
      ]);

      setFuelData(fuelRes.data);
      setTripsData(tripsRes.data);
      setAvailableVehicles(vehiclesRes.data);

      // Grand Total = Fuel Cost + Trip Expenses + Maintenance Cost
      const totalFuel = fuelRes.data.reduce((sum, item) => sum + item.cost, 0);
      const totalTrips = tripsRes.data.reduce((sum, trip) => sum + trip.tollCost + trip.otherCost, 0);
      const totalMaint = maintRes.data.reduce((sum, item) => sum + item.cost, 0);
      
      setGrandTotal(totalFuel + totalTrips + totalMaint);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // --- Handlers ---
  const handleLogFuel = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.recordFuel({
        vehicleId: fuelForm.vehicleId,
        liters: Number(fuelForm.liters),
        cost: Number(fuelForm.cost)
      });
      setFuelForm({ vehicleId: '', liters: '', cost: '' });
      setActiveForm(null);
      fetchLedgerData(); // Refresh Tables
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.updateTripExpenses(expenseForm.tripId, {
        tollCost: Number(expenseForm.tollCost),
        otherCost: Number(expenseForm.otherCost)
      });
      setExpenseForm({ tripId: '', tollCost: '', otherCost: '' });
      setActiveForm(null);
      fetchLedgerData(); // Refresh Tables
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-gray-500 dark:text-gray-400 font-medium">Loading ledger data...</div>;

  return (
    <div className="space-y-10 pb-10">
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* --- INLINE FORMS SECTION --- */}
      {activeForm === 'fuel' && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Record Fuel Receipt</h2>
            <button onClick={() => setActiveForm(null)} className="text-gray-500 hover:text-red-500"><X size={20} /></button>
          </div>
          <form onSubmit={handleLogFuel} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Vehicle</label>
              <select required className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" onChange={e => setFuelForm({...fuelForm, vehicleId: e.target.value})} value={fuelForm.vehicleId}>
                <option value="">-- Choose Asset --</option>
                {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNo} - {v.modelName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Volume (Liters)</label>
              <input type="number" required min="1" step="0.1" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" onChange={e => setFuelForm({...fuelForm, liters: e.target.value})} value={fuelForm.liters} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Cost ($)</label>
              <input type="number" required min="0" step="0.01" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" onChange={e => setFuelForm({...fuelForm, cost: e.target.value})} value={fuelForm.cost} />
            </div>
            <button type="submit" disabled={isSubmitting} className="md:col-span-4 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 rounded transition-colors disabled:opacity-50 mt-2">
              {isSubmitting ? 'Saving...' : 'Save Fuel Log'}
            </button>
          </form>
        </div>
      )}

      {activeForm === 'expense' && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Record Trip Expenses (Tolls / Misc)</h2>
            <button onClick={() => setActiveForm(null)} className="text-gray-500 hover:text-red-500"><X size={20} /></button>
          </div>
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Trip</label>
              <select required className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" onChange={e => setExpenseForm({...expenseForm, tripId: e.target.value})} value={expenseForm.tripId}>
                <option value="">-- Choose Trip --</option>
                {tripsData.map(t => <option key={t.id} value={t.id}>Trip {t.id.substring(0,6).toUpperCase()} ({t.vehicle.registrationNo})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toll Cost ($)</label>
              <input type="number" required min="0" step="0.01" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" onChange={e => setExpenseForm({...expenseForm, tollCost: e.target.value})} value={expenseForm.tollCost} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Other Cost ($)</label>
              <input type="number" required min="0" step="0.01" className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white" onChange={e => setExpenseForm({...expenseForm, otherCost: e.target.value})} value={expenseForm.otherCost} />
            </div>
            <button type="submit" disabled={isSubmitting} className="md:col-span-4 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 rounded transition-colors disabled:opacity-50 mt-2">
              {isSubmitting ? 'Saving...' : 'Update Trip Expenses'}
            </button>
          </form>
        </div>
      )}


      {/* SECTION 1: FUEL LOGS */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-lg font-bold tracking-wider text-gray-900 dark:text-white uppercase">Fuel Logs</h2>
          <div className="flex gap-4">
            <button onClick={() => setActiveForm('fuel')} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
              <Plus size={18} /> Log Fuel
            </button>
            <button onClick={() => setActiveForm('expense')} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
              <Plus size={18} /> Add Expense
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-gray-500 uppercase border-b border-gray-300 dark:border-gray-800">
                <th className="pb-3 px-4">Vehicle</th>
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 px-4">Liters</th>
                <th className="pb-3 px-4">Fuel Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800/50">
              {fuelData.length === 0 ? (
                <tr><td colSpan="4" className="py-4 px-4 text-gray-500">No fuel records found.</td></tr>
              ) : (
                fuelData.map((row) => (
                  <tr key={row.id} className="text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="py-4 px-4 font-medium">{row.vehicle.registrationNo}</td>
                    <td className="py-4 px-4">{formatDate(row.date)}</td>
                    <td className="py-4 px-4">{row.liters} L</td>
                    <td className="py-4 px-4">${row.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 2: OTHER EXPENSES */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-bold tracking-wider text-gray-900 dark:text-white uppercase">Other Expenses (Toll / Misc)</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-gray-500 uppercase border-b border-gray-300 dark:border-gray-800">
                <th className="pb-3 px-4">Trip ID</th>
                <th className="pb-3 px-4">Vehicle</th>
                <th className="pb-3 px-4">Toll</th>
                <th className="pb-3 px-4">Other</th>
                <th className="pb-3 px-4">Maint. (Linked)</th>
                <th className="pb-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800/50">
              {tripsData.length === 0 ? (
                <tr><td colSpan="6" className="py-4 px-4 text-gray-500">No trips found.</td></tr>
              ) : (
                tripsData.map((trip) => (
                  <tr key={trip.id} className="text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-500">TR{trip.id.substring(0,4).toUpperCase()}</td>
                    <td className="py-4 px-4 font-medium">{trip.vehicle.registrationNo}</td>
                    <td className="py-4 px-4 text-gray-500">${trip.tollCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 px-4 text-gray-500">${trip.otherCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 px-4 text-gray-400 italic">--</td>
                    <td className="py-4 px-4">
                      <span className={`px-4 py-1.5 rounded text-sm font-medium ${
                        trip.status === 'COMPLETED' 
                          ? 'bg-lime-600/20 text-lime-600 dark:bg-lime-900/30 dark:text-lime-500 border border-lime-600/30' 
                          : 'bg-green-500/20 text-green-700 dark:bg-green-900/30 dark:text-green-500 border border-green-500/30'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: SUMMARY FOOTER */}
      <section className="pt-6 border-t-2 border-gray-300 dark:border-gray-600 flex justify-between items-center">
        <h3 className="text-base font-bold tracking-wide text-gray-900 dark:text-gray-200 uppercase">
          Total Operational Cost (Auto) = Fuel + Maintenance + Trip Expenses
        </h3>
        <span className="text-2xl font-bold text-amber-600 dark:text-amber-500">
          ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </section>

    </div>
  );
};

export default FuelLogs;