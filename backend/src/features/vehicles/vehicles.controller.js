import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all vehicles (For the Data Table)
export const getAllVehicles = async (req, res, next) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ status: 'success', data: vehicles });
    } catch (error) {
        next(error);
    }
};

// Get ONLY available vehicles (For the Trip Dispatcher dropdown)
export const getAvailableVehicles = async (req, res, next) => {
    try {
        const availableVehicles = await prisma.vehicle.findMany({
            where: { status: 'AVAILABLE' },
            select: { id: true, registrationNo: true, modelName: true, maxCapacity: true }
        });
        res.status(200).json({ status: 'success', data: availableVehicles });
    } catch (error) {
        next(error);
    }
};

// Create a new vehicle
export const createVehicle = async (req, res, next) => {
    try {
        // Note: In a full app, you would validate req.body with Zod here
        const newVehicle = await prisma.vehicle.create({
            data: req.body
        });
        res.status(201).json({ status: 'success', data: newVehicle });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ status: 'fail', message: 'Registration number must be unique.' });
        }
        next(error);
    }
};