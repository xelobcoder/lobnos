import { z } from 'zod';

export const controlMaterialSchema = z.object({
    id: z.string().optional(),
    testId: z.number(),  
    name: z.string().min(1, "Name is required"),
    lotNumber: z.string().min(1, "Lot number is required").optional(),
    sourceType: z.enum(["manufacturer", "sister_lab", "trusted_source"]),
    manufacturer: z.string().optional(),
    sourceName: z.string().optional(),
    expiryDate: z.string().min(1, "Expiry date is required"),
    openedDate: z.string().optional(),
    storageConditions: z.string().min(1, "Storage conditions are required"),
    status: z.enum(["active", "expired", "depleted"]),
    notes: z.string().optional(),
    created: z.number().optional(),
    updated: z.string().optional(),
    deviceId: z.object({
        value: z.string(),
        label: z.string()
    }).or(z.string()),
});

export type ControlMaterialType = z.infer<typeof controlMaterialSchema>;