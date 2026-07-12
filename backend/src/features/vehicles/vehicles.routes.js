import express from 'express';
import { getAllVehicles, getAvailableVehicles, createVehicle } from './vehicles.controller.js';
import { verifyToken, restrictTo } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all vehicle routes
router.use(verifyToken);

router.get('/', getAllVehicles);
router.get('/available', getAvailableVehicles);

// Only Fleet Managers can create new vehicles
router.post('/', restrictTo('FLEET_MANAGER'), createVehicle);

export default router;