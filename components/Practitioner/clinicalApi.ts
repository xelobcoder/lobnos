'use client';
import { customFetch, customFetchMutation } from '../Auth/customFetch';
let capabilityRequest: Promise<any> | null = null;
export async function clinicalApi(path: string, method?: string, body?: any) { const load = async () => { const result = method ? await customFetchMutation(`consultation/${path}`, method, body) : await customFetch(`consultation/${path}`); if (result?.success !== true)
    throw Error(result?.message || 'Unable to complete this clinical action.'); return result.data; }; if (path === 'capabilities' && !method) {
    if (!capabilityRequest)
        capabilityRequest = load().finally(() => { capabilityRequest = null; });
    return capabilityRequest;
} return load(); }
export const observationFields = [['blood_pressure_upperLimit', 'Systolic', 'mmHg'], ['blood_pressure_lowerLimit', 'Diastolic', 'mmHg'], ['temperature', 'Temperature', '°C'], ['pulse', 'Pulse', 'bpm'], ['respiration', 'Respiratory rate', 'breaths/min'], ['spo2', 'SpO₂', '%'], ['weight_kg', 'Weight', 'kg'], ['height_cm', 'Height', 'cm']] as const;
export const recorded = (value: any) => value === null || value === undefined || value === '' ? 'Not recorded' : String(value);
export const observedTime = (row: any) => row.observed_at ? new Date(row.observed_at).toLocaleString('en-GB') : `${String(row.date || '').slice(0, 10)} ${row.time || ''} (historical record)`;
