import { z } from 'zod';

export const createFuelLogSchema = z.object({
    vehicleId: z.string().uuid("Invalid Vehicle ID"),
    liters: z.number().positive("Liters must be greater than 0"),
    cost: z.number().min(0, "Cost cannot be negative")
});