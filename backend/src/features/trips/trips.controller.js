import { PrismaClient } from '@prisma/client';
import { dispatchTripSchema } from './trips.schema.js';

const prisma = new PrismaClient();

export const dispatchTrip = async (req, res, next) => {
    try {
        // 1. Validate incoming data
        const validatedData = dispatchTripSchema.parse(req.body);
        const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = validatedData;

        // 2. Execute within a Transaction to guarantee data integrity
        const result = await prisma.$transaction(async (tx) => {

            // --- A. Validate Vehicle ---
            const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
            if (!vehicle) {
                throw new Error("Vehicle not found");
            }
            if (vehicle.status !== 'AVAILABLE') {
                throw new Error(`Vehicle is currently ${vehicle.status}. Only AVAILABLE vehicles can be dispatched.`);
            }
            if (cargoWeight > vehicle.maxCapacity) {
                throw new Error(`Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg).`);
            }

            // --- B. Validate Driver ---
            const driver = await tx.driver.findUnique({ where: { id: driverId } });
            if (!driver) {
                throw new Error("Driver not found");
            }
            if (driver.status !== 'AVAILABLE') {
                throw new Error(`Driver is currently ${driver.status}. Only AVAILABLE drivers can be assigned.`);
            }

            // --- C. Perform State Transitions (The Business Rules) ---

            // Create the Trip
            const newTrip = await tx.trip.create({
                data: {
                    source,
                    destination,
                    cargoWeight,
                    plannedDistance,
                    vehicleId,
                    driverId,
                    status: 'DISPATCHED'
                }
            });

            // Update Vehicle Status
            await tx.vehicle.update({
                where: { id: vehicleId },
                data: { status: 'ON_TRIP' }
            });

            // Update Driver Status
            await tx.driver.update({
                where: { id: driverId },
                data: { status: 'ON_TRIP' }
            });

            return newTrip;
        });

        // 3. Send Success Response
        res.status(201).json({
            status: 'success',
            message: 'Trip dispatched successfully. Vehicle and Driver are now ON_TRIP.',
            data: result
        });

    } catch (error) {
        // Handle Zod validation errors cleanly
        if (error.name === 'ZodError') {
            return res.status(400).json({
                status: 'fail',
                errors: error.errors.map(e => ({ field: e.path[0], message: e.message }))
            });
        }

        // Pass business logic errors (like capacity exceeded) to the global error handler
        next(error);
    }
};