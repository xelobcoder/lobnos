import { customPost } from '../components/Auth/customFetch';

export interface PrintingTrackingData {
    ascensionid: number;
    employeeid: number;
    action: 'view' | 'printed';
}

/**
 * Sends a tracking request to the backend for report viewing/printing
 * @param data - The tracking data containing ascensionid, employeeid, and action
 * @returns Promise that resolves when the request is complete
 */
export async function trackReportAction(data: PrintingTrackingData): Promise<void> {
    try {
        await customPost('result/printingtracking', 'POST', data);
    } catch (error) {
        console.error('Error tracking report action:', error);
        // Don't throw the error to prevent interrupting the user's workflow
    }
}

/**
 * Helper function to track when a report is viewed
 * @param ascensionid - The ascension ID of the report
 * @param employeeid - The employee ID viewing the report
 */
export async function trackReportView(ascensionid: string | number, employeeid: string | number): Promise<void> {
    if (!ascensionid || !employeeid) return;
    
    await trackReportAction({
        ascensionid: parseInt(ascensionid.toString(), 10),
        employeeid: parseInt(employeeid.toString(), 10),
        action: 'view'
    });
}

/**
 * Helper function to track when a report is printed
 * @param ascensionid - The ascension ID of the report
 * @param employeeid - The employee ID printing the report
 */
export async function trackReportPrint(ascensionid: string | number, employeeid: string | number): Promise<void> {
    if (!ascensionid || !employeeid) return;
    
    await trackReportAction({
        ascensionid: parseInt(ascensionid.toString(), 10),
        employeeid: parseInt(employeeid.toString(), 10),
        action: 'printed'
    });
}
