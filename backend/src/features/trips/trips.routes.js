import express from 'express';
import { dispatchTrip  ,getAllTrips , updateTripExpenses , updateTripStatus} from './trips.controller.js';
// Note: In a real environment, you would import and use your verifyToken middleware here to protect this route.
// import { verifyToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Route: POST /api/trips/dispatch
// router.post('/dispatch', verifyToken, dispatchTrip); 
router.post('/dispatch', dispatchTrip);
router.get('/', getAllTrips);
router.patch('/:id/status', updateTripStatus);
router.patch('/:id/expenses', updateTripExpenses);
export default router;