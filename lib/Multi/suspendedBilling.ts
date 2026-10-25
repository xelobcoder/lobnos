import { customFetch, customFetchMutation, customPost } from '../../components/Auth/customFetch';
import { defaultMultiBillingData, MultiBillingData, ServicesListItem, TestCartItem } from './MultiTypes';

interface DraftItemOptions {
     userAdjustedValue?: number | null;
     userAdjustmentType?: string | null;
     prioritised?: boolean;
}

export interface SuspendedBillingDraft {
     patientid?: number | null;
     isPricingQuote: boolean;
     billingSource: number;
     entitytype?: MultiBillingData['entitytype'];
     entityId?: string | number | null;
     entityname?: string | null;
     specialCode?: string;
     referalCode?: string;
     useSpecialCode?: boolean;
     selectedTestIds: number[];
     selectedServiceIds: number[];
     selectedTestOptions?: Array<DraftItemOptions & {
          testid: number;
          outsourceid?: number | null;
          organization?: { outsourceid: number; name?: string };
     }>;
     selectedServiceOptions?: Array<DraftItemOptions & { keyid: number }>;
     isPackageUsed: boolean;
     packageid?: number;
     includeServices?: boolean;
     nhismembershipid?: string | number | null;
     claimscheckcode?: string | number;
     isPromo?: boolean;
     promoCode?: string | null;
     additionalInfo?: string;
     status?: string;
     notes?: string | null;
}

export function buildSuspendedBillingDraft(data: MultiBillingData, notes: string): SuspendedBillingDraft {
     if (data.isAdjustment) throw new Error('Existing billing adjustments cannot be suspended as new transactions');
     if (!data.ispricingcheckout && !data.patientid) throw new Error('Select a patient before suspending this transaction');
     if (!data.cart.length && !data.servicesProvided.length && !data.isPackageUsed) {
          throw new Error('Select at least one test, service, or package before suspending');
     }
     return {
          patientid: data.patientid || null,
          isPricingQuote: Boolean(data.ispricingcheckout),
          billingSource: Number(data.billingSource),
          entitytype: data.entitytype,
          entityId: data.entityId,
          entityname: data.entityname,
          specialCode: data.specialCode,
          referalCode: data.useSpecialCode ? data.specialCode : undefined,
          useSpecialCode: data.useSpecialCode,
          selectedTestIds: data.cart.map(item => Number(item.testid || item.id)),
          selectedServiceIds: data.servicesProvided.map(item => Number(item.keyid)),
          selectedTestOptions: data.cart.map(item => ({
               testid: Number(item.testid || item.id),
               outsourceid: item.outsourceid,
               organization: item.organization,
               userAdjustedValue: item.userAdjustedValue,
               userAdjustmentType: item.userAdjustmentType,
               prioritised: item.prioritised,
          })),
          selectedServiceOptions: data.servicesProvided.map(item => ({
               keyid: Number(item.keyid),
               userAdjustedValue: item.userAdjustedValue,
               userAdjustmentType: item.userAdjustmentType,
               prioritised: item.prioritised,
          })),
          isPackageUsed: data.isPackageUsed,
          packageid: data.packageid,
          includeServices: data.includeServices || data.servicesProvided.length > 0,
          nhismembershipid: data.nhismembershipid,
          claimscheckcode: data.claimscheckcode,
          isPromo: data.isPromo,
          promoCode: data.promoCode == null ? null : String(data.promoCode),
          additionalInfo: data.additionalInfo,
          status: data.status,
          notes: notes.trim() || null,
     };
}

export async function saveSuspendedBilling(data: MultiBillingData, notes: string): Promise<number> {
     const draft = buildSuspendedBillingDraft(data, notes);
     const response = await customFetchMutation(
          data.suspendedDraftId ? `billing/suspended/${data.suspendedDraftId}` : 'billing/suspended',
          data.suspendedDraftId ? 'PUT' : 'POST',
          draft,
     );
     if (!response?.success || !Number.isSafeInteger(Number(response.data?.id)) || Number(response.data.id) <= 0) {
          throw new Error(response?.message || 'Unable to suspend this transaction');
     }
     return Number(response.data.id);
}

interface BillingInitData extends Partial<MultiBillingData> {
     testList: TestCartItem[];
     message?: string;
     entityType?: MultiBillingData['entitytype'];
     patientId?: number;
     packageTestList?: TestCartItem[];
}

export async function resumeSuspendedBilling(
     draftId: number,
     patientId: number,
     branchId: number,
     employeeId: number,
     isPricingQuote: boolean,
): Promise<{ billingdata: MultiBillingData; notes: string }> {
     const saved = await customFetch(`billing/suspended/${draftId}`);
     if (!saved?.success || !saved.data?.draft_data) throw new Error(saved?.message || 'Unable to load suspended transaction');
     const draft: SuspendedBillingDraft = saved.data.draft_data;
     if (!isPricingQuote && !patientId) throw new Error('Select a patient to convert this quote to a sale');
     if (draft.patientid && Number(draft.patientid) !== patientId) throw new Error('The suspended transaction belongs to a different patient');
     if (!Array.isArray(draft.selectedTestIds) || !Array.isArray(draft.selectedServiceIds)) {
          throw new Error('The suspended transaction has invalid saved selections');
     }
     const sourceTypes: Record<number, NonNullable<MultiBillingData['entitytype']>> = { 1: 'general', 2: 'organization', 3: 'insurance', 4: 'nhis', 6: 'clinician' };
     const query = new URLSearchParams({
          billingSource: String(draft.billingSource),
          entityType: draft.entitytype || sourceTypes[draft.billingSource],
          entityId: String(draft.entityId || ''),
          patientId: String(patientId),
          branchid: String(branchId),
          isPackageUsed: String(draft.isPackageUsed),
          packageid: String(draft.packageid || ''),
          includeServices: String(Boolean(draft.includeServices || draft.selectedServiceIds.length)),
          ispricingcheckout: String(isPricingQuote),
          referalCode: draft.useSpecialCode ? draft.specialCode || draft.referalCode || '' : '',
          nhisMemberId: String(draft.nhismembershipid || ''),
          claimCheckCode: String(draft.claimscheckcode || ''),
     });
     const current: BillingInitData = await customFetch(`billing/multi/init?${query}`);
     if (!Array.isArray(current?.testList)) {
          throw new Error(current?.message || 'Unable to load current billing prices');
     }
     if (draft.selectedServiceIds.length && !Array.isArray(current.servicesList) && draft.isPackageUsed) {
          const serviceQuery = new URLSearchParams(query);
          serviceQuery.set('isPackageUsed', 'false');
          serviceQuery.set('packageid', '');
          const services = await customFetch(`billing/multi/init?${serviceQuery}`);
          if (!Array.isArray(services?.servicesList)) throw new Error(services?.message || 'Unable to load current service prices');
          current.servicesList = services.servicesList;
     }
     const currentTests = draft.isPackageUsed ? current.packageTestList?.length ? current.packageTestList : current.testList : current.testList;
     const cart = draft.isPackageUsed ? currentTests : draft.selectedTestIds.map(id => {
          const test = currentTests.find(item => Number(item.testid || item.id) === Number(id));
          if (!test) throw new Error(`Saved test ${id} is no longer available for this billing source`);
          return test;
     });
     const selectedCart = cart.map(item => ({
          ...item,
          ...draft.selectedTestOptions?.find(option => Number(option.testid) === Number(item.testid || item.id)),
     }));
     const servicesProvided: ServicesListItem[] = draft.selectedServiceIds.map(id => {
          const service = current.servicesList?.find(item => Number(item.keyid) === Number(id));
          if (!service) throw new Error(`Saved service ${id} is no longer available`);
          return { ...service, ...draft.selectedServiceOptions?.find(option => Number(option.keyid) === Number(id)) };
     });
     const checkout = await customPost('billing/multi/checkout', 'POST', {
          patientId, branchid: branchId, employeeid: employeeId,
          cart: selectedCart, servicesList: servicesProvided,
          billingSource: draft.billingSource, entitytype: current.entityType || draft.entitytype || sourceTypes[draft.billingSource],
          entityid: current.entityId ?? draft.entityId,
          referalCode: query.get('referalCode'),
          ispricingcheckout: isPricingQuote, isPackageUsed: draft.isPackageUsed, packageid: draft.packageid,
          isPromo: draft.isPromo, promoCode: draft.promoCode, paymentDetails: null,
     });
     if (!checkout?.success || !checkout.data) throw new Error(checkout?.message || 'Unable to recalculate the suspended transaction');
     const recalculated: BillingInitData = checkout.data;
     const recalculatedCart = ((draft.isPackageUsed ? recalculated.packageTestList : recalculated.cart) || selectedCart)
          .map(item => {
               const options = draft.selectedTestOptions?.find(option => Number(option.testid) === Number(item.testid || item.id));
               return {
                    ...item,
                    ...(options?.organization ? { organization: options.organization } : {}),
                    ...(options?.outsourceid != null ? { outsourceid: options.outsourceid } : {}),
                    ...(options?.prioritised != null ? { prioritised: options.prioritised } : {}),
               };
          });
     const recalculatedServices = (recalculated.servicesList || servicesProvided).map(item => {
          const options = draft.selectedServiceOptions?.find(option => Number(option.keyid) === Number(item.keyid));
          return { ...item, ...(options?.prioritised != null ? { prioritised: options.prioritised } : {}) };
     });
     return {
          billingdata: {
               ...defaultMultiBillingData,
               ...current,
               ...recalculated,
               billingSource: draft.billingSource,
               entitytype: current.entityType || draft.entitytype || sourceTypes[draft.billingSource],
               entityId: current.entityId ?? draft.entityId,
               entityname: draft.entityname || null,
               patientid: patientId || null,
               branchid: branchId,
               employeeid: employeeId,
               suspendedDraftId: draftId,
               ispricingcheckout: isPricingQuote,
               billingid: undefined,
               isAdjustment: 0,
               specialCode: draft.specialCode || draft.referalCode,
               useSpecialCode: draft.useSpecialCode,
               nhismembershipid: draft.nhismembershipid,
               claimscheckcode: draft.claimscheckcode,
               additionalInfo: draft.additionalInfo || '',
               status: draft.status,
               includeServices: Boolean(draft.includeServices || draft.selectedServiceIds.length),
               isPackageUsed: draft.isPackageUsed,
               packageid: draft.packageid,
               cart: recalculatedCart,
               servicesProvided: recalculatedServices,
               servicesList: current.servicesList || [],
               testList: current.testList,
               payments: [],
               paid: 0,
               balance: recalculated.amountPayable || 0,
               showsummary: true,
               allowAdvancePayment: true,
          },
          notes: draft.notes || '',
     };
}

export async function finalizeSuspendedBilling(draftId: number, billingId: number): Promise<void> {
     const response = await customFetchMutation(`billing/suspended/${draftId}/finalize`, 'POST', { billingId });
     if (!response?.success) throw new Error(response?.message || 'The sale was saved, but the suspended transaction could not be marked complete');
}
