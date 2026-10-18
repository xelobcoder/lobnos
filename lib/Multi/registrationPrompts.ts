import { customFetch } from '../../components/Auth/customFetch';

export const DEFAULT_RESULT_DELIVERY_MODE = 'hard copy';

export interface RegistrationPromptSettings {
    homeCollectionPrompt: boolean;
    resultDeliveryPrompt: boolean;
}

const enabled = (value: unknown): boolean | undefined =>
    value === undefined || value === null || value === '' ? undefined : Number(value) === 1 || value === true;

/** Fresh server values win over the login-time cached settings; prompts stay off when neither is known. */
export function resolveRegistrationPromptSettings(fresh: any, cached: any): RegistrationPromptSettings {
    return {
        homeCollectionPrompt: enabled(fresh?.homeCollectionPromptEnabled) ?? enabled(cached?.homeCollectionPromptEnabled) ?? false,
        resultDeliveryPrompt: enabled(fresh?.resultDeliveryPromptEnabled) ?? enabled(cached?.resultDeliveryPromptEnabled) ?? false,
    };
}

export async function loadRegistrationPromptSettings(cached: any): Promise<RegistrationPromptSettings> {
    try {
        const response = await customFetch('applicationsettings');
        const result = Array.isArray(response?.result) ? response.result[0] : response?.result;
        return resolveRegistrationPromptSettings(result, cached);
    } catch {
        return resolveRegistrationPromptSettings(null, cached);
    }
}

export function buildDefaultDeliveryPreferences(cart: any[], employeeid: number, billingid?: number) {
    return (cart || []).map((test: any) => ({
        ...(billingid ? { billingid } : {}),
        testid: test.testid,
        testname: test.testname || test.name || 'Test',
        requested_mode: DEFAULT_RESULT_DELIVERY_MODE,
        requested_mode_detail: null,
        employeeid,
    }));
}
