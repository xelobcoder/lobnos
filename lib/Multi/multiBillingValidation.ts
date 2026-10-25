import { customPost } from "../../components/Auth/customFetch";
import { MultiBillingData } from "./MultiTypes";
import { toast } from "react-toastify";

const BillingFailures = {
	notOrganizationSelected: `organization not selected`,
	notClinicianSelected: `clinician not selected`,
	cartEmpty: 'Test Cart empty for non service only billing',
	serviceAndCartEmpty: 'Test Cart and Services cannot be empty',
	fullPayment: `Full payment must be paid to continue`,
	requiredParametersMissed: `Required Parameters not completed`,
	wrongTaxCalculations: 'Tax inclusive but not considered in the calculation',
	invalidBillingData: 'Invalid billing data or missing billing source',
	NhisFailureMissingClaims: "Claims Code Or NHIS membership ID missing "
};

export const MultiValidateAndSubmitBillingInformation = async function (
	billingdata: MultiBillingData,
	billingid?: number,
) {
	try {

		if (typeof billingdata !== "object" || !billingdata.billingSource) {
			return { status: false, message: BillingFailures.invalidBillingData };
		}

		const {
			billingSource,
			patientid,
			servicesProvided,
			amountPayable,
			isConditionsUnderstood,
			testcost,
			outstanding,
			cart = [],
			cost,
			status,
			hasNightAdjustment,
			discount,
			employeeid,
			branchid,
			type,
			amountIncurredDueTax,
			isPackageUsed,
			promo,
			isPromo,
			isPromoValid,
			promoMethod = '',
			entityId,
			entitytype,
			actualAmountPayable,
			payments = [],
			paymentModes = [],
			paymentStatus,
			billeddate,
			paymentReceived,
			subtotal,
			additionalInfo,
			writeOffOutstanding,
			totaldiscount,
			paid,
			excessAction,
			isAdjustment,
			adjustmentType,
			adjustmentReason,
			promoCodeId,
			totalAmountIncurredDueTax,
			totalServiceAmount,
			additionalinformation,
			balance,
			promoDiscount,
			packageid,
			entityname,
			previousRecordsSummary,
			servicesList = [],
			result_delivery,
			claimscheckcode,
			nhismembershipid,
			previousRecords = [],
			previousPaymentHistory = [],
			promoCode,
			refundList = [],
			clinicianId,
			organizationId,
			finalCart = [],
			finalServicesList = [],
			focStaffId,
			focReason,
			paymentDetails,
			allowFocOverride,
		} = billingdata as any;


		// Benefits and insurer claims are not cash receipts. The server authorizes
		// FOC coverage and recalculates free billing through paymentDetails.
		const specialMode = paymentDetails?.mode || (payments.some((p: any) => p?.mode === 'free') ? 'free' : undefined);
		const cashPayments = payments.filter((p: any) => !['foc', 'free', 'nhis'].includes(String(p?.mode)) && !(billingSource === 4 && p?.amount === 0));
		if (!isAdjustment && adjustmentType !== 'correction') {
			let paymentSum = 0;
			for (const payment of cashPayments) {
				if (!payment?.mode || !Number.isFinite(payment.amount) || payment.amount <= 0) {
					return { status: false, message: 'Each cash payment needs a valid mode and positive amount.' };
				}
				paymentSum += payment.amount;
			}
			if (paymentSum > Number(amountPayable) + 0.009) {
				return { status: false, message: 'Total payment cannot exceed the amount payable.' };
			}
			if (specialMode !== 'foc' && Math.abs(paymentSum - Number(paid)) > 0.009) {
				return { status: false, message: 'Payment entries do not match the amount received.' };
			}
		}

		if ((paid > 0 && finalCart.length === 0 && finalServicesList.length === 0) || (cart.length === 0 && servicesProvided.length === 0)) {
			return { status: false, message: BillingFailures.cartEmpty };
		}
		if (!employeeid || !patientid || !branchid) {
			return { status: false, message: BillingFailures.requiredParametersMissed };
		}
		if ((![1, 4].includes(billingSource)) && !entityId) {
			return { status: false, message: BillingFailures.requiredParametersMissed };
		}


		if (billingSource == 4 && (!billingdata.nhismembershipid || !billingdata.claimscheckcode)) {
			return { status: false, message: BillingFailures.NhisFailureMissingClaims }
		}

		const isFinancialParamsAccurate =
			[subtotal, totaldiscount, balance, amountPayable, paid, totalAmountIncurredDueTax]
				.every(val => typeof val === 'number' && !isNaN(val));

		if (!isFinancialParamsAccurate) {
			return { status: false, message: BillingFailures.requiredParametersMissed };
		}

		const backendData: any = {
			amountPayable,
			cart: finalCart.length > 0 ? finalCart : cart,
			servicesProvided: finalServicesList.length > 0 ? finalServicesList : (servicesProvided || []),
			billingSource,
			outstanding,
			paid,
			promoCodeId,
			promoCode,
			status,
			isConditionsUnderstood,
			patientid: parseInt(patientid?.toString?.() ?? ''),
			billingid: billingid ? parseInt(billingid.toString()) : billingid,
			employeeid,
			entityId,
			isPackageUsed,
			branchid,
			entityid: entityId ? parseInt(entityId.toString()) : null,
			hasNightAdjustment,
			type,
			billeddate,
			entitytype,
			samplingCenter: branchid,
			payments: cashPayments,
			isPromo,
			paymentStatus,
			paymentReceived,
			additionalinformation,
			organizationId: organizationId ? parseInt(organizationId.toString()) : null,
			clinicianId: clinicianId ? parseInt(clinicianId.toString()) : null,
			packageid,
			excessAction,
			isPromoValid,
			result_delivery,
			promoMethod,
			promo,
			adjustmentReason,
			writeOffOutstanding,
			adjustmentType,
			isAdjustment: typeof isAdjustment === 'boolean' ? (isAdjustment ? 1 : 0) : isAdjustment,
			claimscheckcode,
			nhismembershipid,
			focStaffId,
			focReason,
			paymentDetails: { ...paymentDetails, ...(specialMode ? { mode: specialMode } : {}), amount: cashPayments.reduce((sum: number, p: any) => sum + p.amount, 0) },
			allowFocOverride,
		};

		const requestId = (billingdata as any).billingRequestId;
		const appointmentId = (billingdata as any).appointmentId;
		const url = requestId
			? `patient-portal/admin/billing-requests/${requestId}/convert`
			: appointmentId ? `appointments/${appointmentId}/convert` : "billing/multi/submit";
		const response = await customPost(url, "POST", backendData);
		if (response.status && response.status === 'pending verification') {
			return response;
		}

		// If backend returns updated billing data, return it for context update
		if (response.status === true || response.status === 'success' || response.success === true) {
			toast.success(response.message || 'Billing submitted successfully', {
				position: "top-right",
				autoClose: 1000,
				hideProgressBar: false,
			});
			return { ...response, updatedBillingData: response.data || response.updatedBillingData || null };
		}

		return response;
	} catch (err: any) {
		console.log(err)
		return { status: false, message: "Error occurred during transit", details: err.message };
	}
};
