import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req, res, next) => {
    try {
        // 1. Active Vehicles (Total available + currently on trip)
        const activeVehicles = await prisma.vehicle.count({
            where: { status: { in: ['AVAILABLE', 'ON_TRIP'] } }
        });

        // 2. Vehicles In Maintenance
        const inMaintenance = await prisma.vehicle.count({
            where: { status: 'IN_SHOP' }
        });

        // 3. Active Trips (Trips that are currently dispatched)
        const activeTrips = await prisma.trip.count({
            where: { status: 'DISPATCHED' }
        });

        // 4. Fleet Utilization (Percentage of operable vehicles currently on a trip)
        const vehiclesOnTrip = await prisma.vehicle.count({
            where: { status: 'ON_TRIP' }
        });
        const totalOperableFleet = await prisma.vehicle.count({
            where: { status: { not: 'RETIRED' } }
        });

        const utilization = totalOperableFleet > 0 
            ? Math.round((vehiclesOnTrip / totalOperableFleet) * 100) 
            : 0;

        res.status(200).json({
            status: 'success',
            data: {
                activeVehicles,
                inMaintenance,
                activeTrips,
                utilization
            }
        });
    } catch (error) {
        next(error);
    }
};