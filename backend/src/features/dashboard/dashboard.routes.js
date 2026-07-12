import express from 'express';
import { getDashboardStats } from './dashboard.controller.js';
// import { verifyToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Apply verifyToken middleware here when your auth is fully strict
router.get('/stats', getDashboardStats);

export default router;