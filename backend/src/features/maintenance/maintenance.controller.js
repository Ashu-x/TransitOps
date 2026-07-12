import { PrismaClient } from '@prisma-client/js';
import { createMaintenanceSchema } from './maintenance.schema.js';

const prisma = new PrismaClient();

// Create Log & Change Status to IN_SHOP
export const createMaintenanceRecord = async (req, res, next) => {
    try {
        const { vehicleId, description, cost } = createMaintenanceSchema.parse(req.body);

        // Execute as a transaction to ensure data integrity
        const result = await prisma.$transaction(async (tx) => {
            const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });

            if (!vehicle) throw new Error("Vehicle not found");
            if (vehicle.status === 'ON_TRIP') throw new Error("Cannot maintain a vehicle currently ON_TRIP");

            // 1. Create the log
            const log = await tx.maintenanceLog.create({
                data: { vehicleId, description, cost }
            });

            // 2. Update vehicle status
            await tx.vehicle.update({
                where: { id: vehicleId },
                data: { status: 'IN_SHOP' }
            });

            return log;
        });

        res.status(201).json({
            status: 'success',
            message: 'Maintenance logged. Vehicle is now IN_SHOP.',
            data: result
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                status: 'fail',
                errors: error.errors.map(e => ({ field: e.path[0], message: e.message }))
            });
        }
        next(error);
    }
};

// Close Maintenance & Restore Status to AVAILABLE
export const closeMaintenanceRecord = async (req, res, next) => {
    try {
        const { id } = req.params; // Maintenance Log ID

        const result = await prisma.$transaction(async (tx) => {
            const log = await tx.maintenanceLog.findUnique({ where: { id } });
            if (!log) throw new Error("Maintenance record not found");
            if (log.isClosed) throw new Error("Record is already closed");

            // 1. Mark log as closed
            const updatedLog = await tx.maintenanceLog.update({
                where: { id },
                data: { isClosed: true }
            });

            // 2. Restore vehicle to available (unless it was manually retired)
            const vehicle = await tx.vehicle.findUnique({ where: { id: log.vehicleId } });
            if (vehicle.status !== 'RETIRED') {
                await tx.vehicle.update({
                    where: { id: log.vehicleId },
                    data: { status: 'AVAILABLE' }
                });
            }

            return updatedLog;
        });

        res.status(200).json({
            status: 'success',
            message: 'Maintenance closed. Vehicle is now AVAILABLE.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};