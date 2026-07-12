import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { ThemeProvider } from './context/ThemeContext';

const Dashboard = () => <div className="text-gray-900 dark:text-white">Dashboard Overview</div>;
const Vehicles = () => <div className="text-gray-900 dark:text-white">Vehicle Registry</div>;
const Drivers = () => <div className="text-gray-900 dark:text-white">Driver Management</div>;
const Trips = () => <div className="text-gray-900 dark:text-white">hello aditya </div>;
const Maintenance = () => <div className="text-gray-900 dark:text-white">hello maintenance </div>;

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="trips" element={<Trips />} />
            <Route path="maintenance" element={<Maintenance />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;