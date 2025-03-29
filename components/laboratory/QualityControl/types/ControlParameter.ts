import { z } from 'zod';

export const controlParameterSchema = z.object({
    id: z.string().optional(),
    controlMaterialId: z.string(),
    parameter: z.string().min(1, "Parameter name is required"),
    value: z.number().min(0, "Value must be positive"),
    unit: z.string().min(1, "Unit is required"),
    standardDeviation: z.number().optional(),
    warningLimit: z.number().optional(),
    actionLimit: z.number().optional(),
    validationNotes: z.string().optional(),
    created: z.number().optional(),
    updated: z.string().optional()
});

export type ControlParameterType = z.infer<typeof controlParameterSchema>;