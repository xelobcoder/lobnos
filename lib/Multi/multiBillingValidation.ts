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
        console.log(billingdata);
        if (typeof billingdata !== "object" || !billingdata.billingSource) {
            return { error: BillingFailures.invalidBillingData };
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
        } = billingdata as any;


        // Payment validation is now optional for order flow. Only validate if payments are present.
        let paymentSum = 0;
        const paymentModesSet = new Set();
        if (Array.isArray(payments) && payments.length > 0 && !isAdjustment && adjustmentType != 'correction') {
            for (const payment of payments) {
                if (!payment || typeof payment.amount !== 'number' || payment.amount <= 0) {
                    return { error: 'Each payment must have a valid, positive amount.' };
                }
                if (!payment.mode) {
                    return { error: 'Each payment must have a valid payment mode.' };
                }
                if (paymentModesSet.has(payment.mode)) {
                    return { error: 'Duplicate payment modes are not allowed.' };
                }
                paymentModesSet.add(payment.mode);
                paymentSum += payment.amount;
            }
            const expectedAmount = actualAmountPayable || amountPayable;
            if (!(isAdjustment && adjustmentType === 'correction')) {
                if (Math.abs(paymentSum - expectedAmount) > 0.009) {
                    return { error: 'Total payment amount must exactly match the amount payable.' };
                }
            }
        }

        if ((paid > 0 && finalCart.length === 0 && finalServicesList.length === 0) || (cart.length === 0 && servicesProvided.length === 0)) {
            return { error: BillingFailures.cartEmpty };
        }
        if (!employeeid || !patientid || !branchid) {
            return { error: BillingFailures.requiredParametersMissed };
        }
        if ((![1, 4].includes(billingSource)) && !entityId) {
            return { error: BillingFailures.requiredParametersMissed };
        }


        if (billingSource == 4 && (!billingdata.nhismembershipid || !billingdata.claimscheckcode)) {
            return { error: BillingFailures.NhisFailureMissingClaims }
        }

        const isFinancialParamsAccurate =
            [subtotal, totaldiscount, balance, amountPayable, paid, totalAmountIncurredDueTax]
                .every(val => typeof val === 'number' && !isNaN(val));

        if (!isFinancialParamsAccurate) {
            return { error: BillingFailures.requiredParametersMissed };
        }

        const backendData: any = {
            amountPayable,
            cart: finalCart.length > 0 ? finalCart : cart,
            servicesProvided: finalServicesList.length > 0 ? finalServicesList : [],
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
            payments,
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
        };

        const url = "billing/multi/submit";
        const response = await customPost(url, "POST", backendData);
        if (response.status && response.status === 'pending verification') {
            return response;
        }

        // If backend returns updated billing data, return it for context update
        if (response.status === true || response.status === 'success' || response.success === true) {
            toast.success(response.message || 'Billing submitted successfully');
            return { ...response, updatedBillingData: response.data || response.updatedBillingData || null };
        }

        return response;
    } catch (err: any) {
        console.log(err)
        return { status: "error", message: "Error occurred during transit", details: err.message };
    }
};
