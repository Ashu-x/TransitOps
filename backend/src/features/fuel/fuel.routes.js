import express from 'express';
import { recordFuel, getOperationalCost, getAllFuelLogs } from './fuel.controller.js';
// import { verifyToken, restrictTo } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllFuelLogs);
router.post('/', recordFuel);
router.get('/:vehicleId/costs', getOperationalCost);
export default router;