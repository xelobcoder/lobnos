import React from 'react';
import { currencyFormatter, customFetch } from '../../../../../components/Auth/customFetch';
import { plsDecryption } from '../../../../../lib/encryption';
import { getOustandingBill } from '../../../../../lib/billingLib';
import BillingUpdateClientPaymentHistoryComponent from '../../../../../components/Billing/UpdatingOutstandingDebt/UpdatOutstandingDebt';
import RSCPreviewPatientInformation from '../../../../../components/petientsComponent/RSCPreviewPatientInformation';
import PrimeBreadcrumb from '../../../../../components/accessories/PrimeBreadCrumb';

interface Params {
    patientid: string;
    outstandingAmount: string;
}

export default async function PatientBillingOutstandingDebt({ params }: { params: Params }) {
    const { patientid } = params;
    let outOutstandingAmount: number = 0;
    let paymentModes: any[] = [];
    let outstandingTransactions: any[] = [];

    const patientIdDecrypted = plsDecryption(patientid);

    const fetchBillingData = async () => {
        try {
            const outstandingData = customFetch(`billing/client/bulk/outstanding?patientid=${parseInt(patientIdDecrypted)}`);
            const paymentmodes = customFetch('paymentmodes');
            const getOutstandingAmount = getOustandingBill(patientIdDecrypted);
            const response = await Promise.all([outstandingData, paymentmodes, getOutstandingAmount]);

            const outOutstandingAmountResponse = response[2];
            if (typeof outOutstandingAmountResponse === "number" && outOutstandingAmountResponse > 0) {
                outOutstandingAmount = outOutstandingAmountResponse;
            }

            const outstandingTransactionsResponse = response[0];
            if (outstandingTransactionsResponse) {
                outstandingTransactions = outstandingTransactionsResponse?.result;
            }

            const paymentModesResponse = response[1];
            if (paymentModesResponse) {
                paymentModes = paymentModesResponse?.data;
            }
        } catch (err) {
            console.error('Error fetching billing data:', err);
        }
    };

    await fetchBillingData();

    const linksBread = [
        { href: `/billing/patientid/${patientid}`, label: 'Back to billing page' }
    ]

    return (
        <div className="mx-2">
            <PrimeBreadcrumb links={linksBread} />
            <h4 className="p-3 br-5 bg-secondary-subtle text-center text-md-start">
                Outstanding Debt
            </h4>
            <div className="row">
                <div className="col-12 col-md-6 mb-3 mb-md-0 col-sm-12">
                    <RSCPreviewPatientInformation patientid={patientIdDecrypted} />
                </div>
                <div className="col-12 col-md-6 col-sm-12">
                    <div className="alert alert-danger pls-color d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="72" height="72" fill="currentColor">
                            <path fill="none" d="M0 0h24v24H0z"></path>
                            <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path>
                        </svg>
                        <h2>{currencyFormatter.format(outOutstandingAmount || 0)}</h2>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <BillingUpdateClientPaymentHistoryComponent
                    patientid={parseInt(patientIdDecrypted)}
                    paymentModes={paymentModes}
                    outstandingData={outstandingTransactions}
                />
            </div>
        </div>
    );
}
