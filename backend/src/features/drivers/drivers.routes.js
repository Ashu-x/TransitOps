import express from 'express';
import { getAllDrivers, getAvailableDrivers, createDriver } from './drivers.controller.js';
// import { verifyToken, restrictTo } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// router.use(verifyToken); // Uncomment when auth is fully wired in your frontend

router.get('/', getAllDrivers);
router.get('/available', getAvailableDrivers);

// router.post('/', restrictTo('FLEET_MANAGER', 'SAFETY_OFFICER'), createDriver);
router.post('/', createDriver);

export default router;