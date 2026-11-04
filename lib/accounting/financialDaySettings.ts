import { customFetch, customPost } from '../../components/Auth/customFetch';
import type { ApiResponse } from './accountingApi';

export interface FinancialDaySettings {
     policy: { enabled: boolean; graceHours: number };
     bounds: { earliestDate: string | null; latestDate: string | null; currentDate: string };
     ranges: Array<{ id: number; startDate: string; endDate: string; reason: string; createdBy: number; createdAt: string }>;
}

export interface HistoricalLockPreview {
     financialDayCount: number;
     alreadyLockedDayCount: number;
     eligibleDayCount: number;
}

export interface HistoricalDateRange { startDate: string; endDate: string }
export interface FinancialDayPolicyInput { enabled: boolean; graceHours: number; reason: string }

// Context is supplied only by the existing authenticated fetch helpers.
export const financialDaySettingsApi = {
     get(): Promise<ApiResponse<FinancialDaySettings>> {
          return customFetch('financial-day/settings');
     },
     savePolicy(payload: FinancialDayPolicyInput): Promise<ApiResponse<FinancialDaySettings>> {
          return customPost('financial-day/settings', 'PUT', payload);
     },
     preview(payload: HistoricalDateRange): Promise<ApiResponse<HistoricalLockPreview>> {
          return customPost('financial-day/historical-locks/preview', 'POST', payload);
     },
     lock(payload: HistoricalDateRange & { reason: string; confirm: true }): Promise<ApiResponse<FinancialDaySettings>> {
          return customPost('financial-day/historical-locks', 'POST', payload);
     },
};

export function validFinancialDate(value: string): boolean {
     if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
     const date = new Date(`${value}T00:00:00.000Z`);
     return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function serverYesterday(currentDate: string): string {
     if (!validFinancialDate(currentDate)) throw new Error('The server returned an invalid current date. Refresh before continuing.');
     const date = new Date(`${currentDate}T00:00:00.000Z`);
     date.setUTCDate(date.getUTCDate() - 1);
     return date.toISOString().slice(0, 10);
}

export function defaultMigrationRange(bounds: FinancialDaySettings['bounds']): HistoricalDateRange {
     const yesterday = serverYesterday(bounds.currentDate);
     return {
          startDate: bounds.earliestDate && bounds.earliestDate <= yesterday ? bounds.earliestDate : '',
          endDate: yesterday,
     };
}

export function historicalRangeError(range: HistoricalDateRange, currentDate: string): string {
     if (!validFinancialDate(range.startDate) || !validFinancialDate(range.endDate)) return 'Choose valid start and end dates.';
     if (range.startDate > range.endDate) return 'The start date must be on or before the end date.';
     if (!validFinancialDate(currentDate) || range.endDate >= currentDate) return 'Historical locks cannot include today or future dates. Use the current server date shown above.';
     return '';
}

export function reasonError(reason: string): string {
     return !reason.trim() || reason.trim().length > 1000 ? 'Enter a reason of 1–1000 characters.' : '';
}

export function policyError(hours: string, reason: string): string {
     const value = Number(hours);
     if (!hours.trim() || !Number.isSafeInteger(value) || value <= 0 || value > 8760) return 'The closing interval must be a whole number from 1 to 8760 hours.';
     return reasonError(reason);
}

export function settingsResult(response: ApiResponse<FinancialDaySettings>): FinancialDaySettings {
     const result = response?.result;
     if (response?.status !== 'success' || response.statusCode < 200 || response.statusCode >= 300 ||
          typeof result?.policy?.enabled !== 'boolean' ||
          !Number.isSafeInteger(result.policy.graceHours) || result.policy.graceHours < 1 || result.policy.graceHours > 8760 ||
          !validFinancialDate(result?.bounds?.currentDate) ||
          (result.bounds.earliestDate !== null && !validFinancialDate(result.bounds.earliestDate)) ||
          (result.bounds.latestDate !== null && !validFinancialDate(result.bounds.latestDate)) ||
          !Array.isArray(result.ranges)) {
          throw new Error(response?.message || 'Unable to load financial-day settings. Refresh or contact your administrator.');
     }
     return result;
}

export function previewResult(response: ApiResponse<HistoricalLockPreview>): HistoricalLockPreview {
     const result = response?.result;
     if (response?.status !== 'success' || !result ||
          ![result.financialDayCount, result.alreadyLockedDayCount, result.eligibleDayCount].every(value => Number.isSafeInteger(value) && value >= 0)) {
          throw new Error(response?.message || 'Unable to preview historical locks. Please retry.');
     }
     return result;
}
