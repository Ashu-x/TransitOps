import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all drivers for the main table
export const getAllDrivers = async (req, res, next) => {
    try {
        const drivers = await prisma.driver.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ status: 'success', data: drivers });
    } catch (error) {
        next(error);
    }
};

// Get ONLY available drivers for the Trip Dispatcher dropdown
export const getAvailableDrivers = async (req, res, next) => {
    try {
        const availableDrivers = await prisma.driver.findMany({
            where: { status: 'AVAILABLE' },
            select: { id: true, name: true, licenseNumber: true, safetyScore: true }
        });
        res.status(200).json({ status: 'success', data: availableDrivers });
    } catch (error) {
        next(error);
    }
};

// Create a new driver (Fleet Manager or Safety Officer)
export const createDriver = async (req, res, next) => {
    try {
        const newDriver = await prisma.driver.create({
            data: req.body
        });
        res.status(201).json({ status: 'success', data: newDriver });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ status: 'fail', message: 'License number must be unique.' });
        }
        next(error);
    }
};