import { PrismaClient } from '@prisma/client';
import { createFuelLogSchema } from './fuel.schema.js';

const prisma = new PrismaClient();

// Record a Fuel Log
export const recordFuel = async (req, res, next) => {
    try {
        const data = createFuelLogSchema.parse(req.body);

        const fuelLog = await prisma.fuelLog.create({
            data
        });

        res.status(201).json({ status: 'success', data: fuelLog });
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

// Compute Total Operational Cost (Fuel + Maintenance)
export const getOperationalCost = async (req, res, next) => {
    try {
        const { vehicleId } = req.params;

        // Verify vehicle exists
        const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
        if (!vehicle) return res.status(404).json({ status: 'fail', message: 'Vehicle not found' });

        // Sum Fuel Costs
        const fuelAggregate = await prisma.fuelLog.aggregate({
            _sum: { cost: true },
            where: { vehicleId }
        });

        // Sum Maintenance Costs
        const maintenanceAggregate = await prisma.maintenanceLog.aggregate({
            _sum: { cost: true },
            where: { vehicleId }
        });

        const totalFuelCost = fuelAggregate._sum.cost || 0;
        const totalMaintenanceCost = maintenanceAggregate._sum.cost || 0;
        const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

        res.status(200).json({
            status: 'success',
            data: {
                vehicleId,
                registrationNo: vehicle.registrationNo,
                breakdown: {
                    fuelCost: totalFuelCost,
                    maintenanceCost: totalMaintenanceCost
                },
                totalOperationalCost
            }
        });
    } catch (error) {
        next(error);
    }
};