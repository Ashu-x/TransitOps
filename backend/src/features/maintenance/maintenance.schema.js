import { z } from 'zod';

export const createMaintenanceSchema = z.object({
    vehicleId: z.string().uuid("Invalid Vehicle ID"),
    description: z.string().min(3, "Description must be at least 3 characters"),
    cost: z.number().min(0, "Cost cannot be negative")
});