import { z } from 'zod';

export const dispatchTripSchema = z.object({
    source: z.string().min(2, "Source must be at least 2 characters"),
    destination: z.string().min(2, "Destination must be at least 2 characters"),
    vehicleId: z.string().uuid("Invalid Vehicle ID"),
    driverId: z.string().uuid("Invalid Driver ID"),
    cargoWeight: z.number().positive("Cargo weight must be greater than 0"),
    plannedDistance: z.number().positive("Distance must be greater than 0").optional()
});