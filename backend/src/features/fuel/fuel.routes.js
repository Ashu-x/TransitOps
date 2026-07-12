import express from 'express';
import { recordFuel, getOperationalCost } from './fuel.controller.js';
// import { verifyToken, restrictTo } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', recordFuel);
router.get('/:vehicleId/costs', getOperationalCost);

export default router;