import { create } from 'domain';
import { z } from 'zod';

export const deviceSchema = z.object({
    id: z.string().optional(),
    deviceName: z.string().min(1, 'Device name is required'),
    model: z.string().min(1, 'Model is required'),
    serialNumber: z.string().min(1, 'Serial number is required'),
    manufacturer: z.string().min(1, 'Manufacturer is required'),
    installationDate: z.string().min(1, 'Installation date is required'),
    lastCalibrationDate: z.string().min(1, 'Last calibration date is required'),
    calibrationFrequency: z.number().min(1, 'Calibration frequency must be at least 1 day'),
    location: z.string().min(1, 'Location is required'),
    status: z.enum(['active', 'maintenance', 'inactive']),
    notes: z.string().optional(),
    updatedby: z.string().optional(),
    createdby: z.string().optional(),
});

export type DeviceType = z.infer<typeof deviceSchema>;