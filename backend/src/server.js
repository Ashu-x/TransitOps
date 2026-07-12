import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());


import authRoutes from './features/auth/auth.routes.js';
import vehicleRoutes from './features/vehicles/vehicles.routes.js';
import driverRoutes from './features/drivers/drivers.routes.js';
import tripRoutes from './features/trips/trips.routes.js';
import maintenanceRoutes from './features/maintenance/maintenance.routes.js';
import fuelRoutes from './features/fuel/fuel.routes.js';

// --- API Endpoints ---
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'TransitOps API is running.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});