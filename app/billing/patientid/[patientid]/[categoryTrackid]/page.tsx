import { redirect } from "next/navigation";
import BillingPagePatientInformation from "../../../../../components/Billing/BillingContextComponents/PersonalInfoView";
import { Billingdefaultdata, getOustandingBill, getAllNecessaryData, fetchPreviousBilledRecords, canIgnoreDebtPaymentAndTax } from "../../../../../lib/billingLib";
import { plsDecryption } from "../../../../../lib/encryption";
import { customFetch } from "../../../../../components/Auth/customFetch";
import BillingPageLayout from '../../../../../components/Billing/BillingContextComponents/BillingPageLayout';



interface Params {
	categoryTrackid: number;
	patientid: string;
}

const getTransactionPreviousBillingRecords = async (billingid: number) => {
	try {
		const response = await customFetch(`billing/previous/transaction/data?billingid=${billingid}`);
		return response;
	} catch (err) {
		return [];
	}
};

export default async function PatientBillingPageIndex({
	params,
	searchParams,
}: {
	params: Params;
	searchParams: {
		billingid: number;
		isNewTransaction: '0' | '1';
		isServiceOnly: '0' | '1';
		isSource?: 'unknown' | 'determine'
	};
}) {
	const { patientid, categoryTrackid } = params;
	const { billingid, isNewTransaction, isServiceOnly, isSource } = searchParams;
	let billingdata = Billingdefaultdata;
	let patientBasicInformation = {};
	let previousRecords = [];
	let previousRecordData = {
		previousOutstanding: 0,
		previousTotalCost: 0,
		previousPaid: 0,
		previousRefunded: 0,
		previousBalance: 0,
		previousAmountIncurredDueTax: 0,
		previousPayable: 0,
	};
	let outstandingDebt: 'ERROR' | undefined | number = undefined


	const patientIdDecrypted = plsDecryption(patientid);

	if (!patientIdDecrypted) {
		return (
			<h4 className="pls-color bg-s p-4 br-5 secondary-subtle">
				Patient Identification Failed
			</h4>
		);
	}


	try {
		outstandingDebt = await getOustandingBill(patientIdDecrypted);
	} catch (err) {
		return (
			<h4 className="pls-color bg-s p-4 br-5 secondary-subtle">
				Error loading billing data. Please try again later.
			</h4>
		);
	}

	if (typeof outstandingDebt === 'number' && outstandingDebt > 0) {
		redirect(`/billing/cash-collection?patientid=${patientIdDecrypted}`);
	}

	if (typeof outstandingDebt === 'number' && outstandingDebt == 0) {
		billingdata.outstandingDebt = 0;
	}



	try {

		const [billingNightAdjustmentSettings, initGeneralBillingData, paymentModes] = await Promise.all([
			customFetch(`applicationsettings/target/billingsettings`),
			getAllNecessaryData(),
			customFetch('paymentmodes'),
		]);

		if (billingid) {
			previousRecords = await fetchPreviousBilledRecords(billingid);
			billingdata.previousRecords = previousRecords
		}

		if (billingid && isNewTransaction === '0') {
			const { result: previousTransactionSummary } = await getTransactionPreviousBillingRecords(billingid);

			if (Array.isArray(previousTransactionSummary) && previousTransactionSummary.length > 0) {
				const {
					totalcost,
					paid,
					amountIncurredDueTax,
					totalrefunded,
					outstanding,
					balance,
					payable,
				} = previousTransactionSummary[0];

				previousRecordData = {
					...previousRecordData,
					previousTotalCost: totalcost,
					previousPaid: paid,
					previousRefunded: totalrefunded,
					previousOutstanding: outstanding,
					previousBalance: balance,
					previousAmountIncurredDueTax: amountIncurredDueTax,
					previousPayable: payable,
				};

				billingdata = { ...billingdata, ...previousRecordData };
			}
		}

		const { billingsettings } = billingNightAdjustmentSettings;
		if (billingsettings?.hasNightAdjustment) {
			billingdata.hasNightAdjustment = billingsettings.hasNightAdjustment;
			billingdata.nightAdjustmentMode = billingsettings.nightAdjustmentMode;
			billingdata.nightAdjustmentValue = parseFloat(billingsettings.nightAdjustmentValue);
			const { endTime, startTime } = billingsettings;
			const parsedStart = startTime ? parsedTimeValue(startTime) : billingdata.startTime;
			billingdata.nightStart = parsedStart ?? 0;
			const parsedEnd = endTime ? parsedTimeValue(endTime) : billingdata.endTime;
			billingdata.nightEnd = parsedEnd ?? 0;
		}

		if (paymentModes && typeof paymentModes === 'object' && Object.keys(paymentModes).length > 0 && paymentModes.data && Array.isArray(paymentModes.data) && paymentModes.data.length > 0
		) {
			billingdata.paymentmodeData = paymentModes?.data;
		}

		if (typeof initGeneralBillingData === 'object' && Object.keys(initGeneralBillingData).length > 0) {
			billingdata = { ...billingdata, ...initGeneralBillingData, billingSource: 0 };
		}



		const { result } = await customFetch(`register/personalinformation?patientid=${patientIdDecrypted}`);
		patientBasicInformation = result;
		const _vitalInfo = await canIgnoreDebtPaymentAndTax();

		if (_vitalInfo) {
			const { PaidBillsBeforeTransaction, includeTax, taxValue } = _vitalInfo;
			billingdata = {
				...billingdata,
				cantIgnoreDebt: PaidBillsBeforeTransaction == 1,
				appsettings: {
					taxIncluded: includeTax == 1 || includeTax == '1',
					taxValue,
				},
				taxIncluded: includeTax == 1 || includeTax == '1',
				taxValue: parseFloat(taxValue) || 0,
			};

		}

		if (categoryTrackid && categoryTrackid !== 0) {
			billingdata.billingSource = parseInt(categoryTrackid.toString());
			billingdata.lockSource = true;
			billingdata.previewPrevious = true;
		}

		if (!categoryTrackid || billingid && Array.isArray(previousRecords) && previousRecords.length > 0 && isSource && isSource === 'determine') {
			// bind to first value of previousRecords
			interface PreviousRecord {
				[key: string]: any;
				categoryTrackId: number;
			}
			const firstRecord: PreviousRecord = previousRecords[0];
			if (firstRecord && firstRecord.categoryTrackId) {
				billingdata.billingSource = parseInt(firstRecord.categoryTrackId.toString());
				billingdata.lockSource = true;
				billingdata.previewPrevious = true;
			} else {
				billingdata.billingSource = 0;
				billingdata.lockSource = false;
			}
		}



	} catch (error) {
		return (
			<h4 className="pls-color bg-s p-4 br-5 secondary-subtle">
				Error loading billing data. Please try again later.
			</h4>
		);
	}

	return (
		<div>
			<BillingPagePatientInformation data={patientBasicInformation} />
			<BillingPageLayout unencryptedid={patientid} patientid={patientIdDecrypted} initdata={billingdata} />
		</div>
	);
}

const parsedTimeValue = (value: string | null) => {
	return value && typeof value === 'string' && value.includes(':')
		? parseInt(value.split(':')[0])
		: null;
};