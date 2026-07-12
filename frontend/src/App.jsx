import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { ThemeProvider } from './context/ThemeContext';

// Import our new real page
import Vehicles from './pages/Vehicles'; 

// Leave these as placeholders for now
const Dashboard = () => <div className="text-gray-900 dark:text-white">Dashboard Overview</div>;
const Drivers = () => <div className="text-gray-900 dark:text-white">Driver Management</div>;
const Trips = () => <div className="text-gray-900 dark:text-white">Trip Dispatcher</div>;

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            
            {/* Connect the real Vehicles page here */}
            <Route path="vehicles" element={<Vehicles />} />
            
            <Route path="drivers" element={<Drivers />} />
            <Route path="trips" element={<Trips />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;