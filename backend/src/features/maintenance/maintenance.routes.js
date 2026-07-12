import express from 'express';
import { createMaintenanceRecord,getAllMaintenance, closeMaintenanceRecord, getActiveMaintenance } from './maintenance.controller.js';
// import { verifyToken, restrictTo } from '../../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/active', getActiveMaintenance);
router.post('/', createMaintenanceRecord);
router.patch('/:id/close', closeMaintenanceRecord);
router.get('/', getAllMaintenance); 
export default router;