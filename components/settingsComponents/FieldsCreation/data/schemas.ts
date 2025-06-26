import { z } from 'zod';

export const CreationRuleSchema = z.object({
    name: z.string().min(1, "Field name is required"),
    field: z.string(),
    value: z.string(),
    options: z.string(),
    testid: z.number(),
    category: z.string().optional(),
    undercategory: z.number().int().min(0).optional(),
    hasunits: z.boolean(),
    units: z.string(),
    plan: z.string(),
    plain: z.string(),
    fieldConstraints: z.array(z.any()),
    ordering: z.string().optional(),
    isValueTracked: z.number().int().min(0).optional(),
    textReference: z.string().optional(),
});

export type CreationRuleValidation = z.infer<typeof CreationRuleSchema>;