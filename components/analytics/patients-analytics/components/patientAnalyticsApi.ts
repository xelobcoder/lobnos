import { customFetch } from '../../../Auth/customFetch';
import {
	assertPatientAnalyticsModuleEnabled,
	assertPatientAnalyticsRequestSucceeded,
} from './patientAnalyticsAccess';

/**
 * Fetch a patient analytics endpoint and reject the module-inactive JSON body
 * before any individual report attempts to parse it as metrics.
 */
export async function fetchPatientAnalytics(endpoint: string): Promise<unknown> {
	const response = assertPatientAnalyticsModuleEnabled(await customFetch(endpoint));
	return assertPatientAnalyticsRequestSucceeded(response);
}
