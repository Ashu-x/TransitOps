import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import TripDispatcher from './pages/TripDispatcher';
import Signup from './pages/Signup';
import Maintenance from './pages/Maintenance';
import FuelLogs from './pages/FuelLogs';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider> 
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes (Must be logged in) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardLayout />}>
                
                {/* Everyone can see the Dashboard */}
                <Route index element={<Dashboard />} />
                
                {/* --- SAFETY OFFICER & MANAGER --- */}
                <Route element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'SAFETY_OFFICER']} />}>
                  <Route path="drivers" element={<Drivers />} />
                </Route>

                {/* --- DISPATCHER (DRIVER ROLE) & MANAGER --- */}
                <Route element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DRIVER']} />}>
                  <Route path="trips" element={<TripDispatcher />} />
                </Route>

                {/* --- FINANCIAL ANALYST & MANAGER --- */}
                <Route element={<ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']} />}>
                  <Route path="fuel" element={<FuelLogs />} />
                </Route>

                {/* --- FLEET MANAGER ONLY --- */}
                <Route element={<ProtectedRoute allowedRoles={['FLEET_MANAGER']} />}>
                  <Route path="vehicles" element={<Vehicles />} />
                  <Route path="maintenance" element={<Maintenance />} />
                </Route>

              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;