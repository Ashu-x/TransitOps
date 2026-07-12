import express from 'express';
import { createMaintenanceRecord, closeMaintenanceRecord } from './maintenance.controller.js';
// import { verifyToken, restrictTo } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', createMaintenanceRecord);
router.patch('/:id/close', closeMaintenanceRecord);

export default router;