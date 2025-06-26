import { Row, Spinner, Modal, Button } from "react-bootstrap";
import { useContext, useState } from "react";
import { MultiBillingContext } from "./MultiBillingContext";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import ReceiptOptionsModal from "../ReceiptOptionsModal";
import { RiMoneyDollarCircleLine, RiCloseLine, RiPrinterLine, RiStore3Line } from '@remixicon/react';
import { useRouter } from "next/navigation";
import { plsEncryption } from "../../../lib/encryption";
import { MultiBillingData, defaultMultiBillingData } from '../../../lib/Multi/MultiTypes';
import MultiPayment from './MultiPayment';
import { MultiValidateAndSubmitBillingInformation } from "../../../lib/Multi/multiBillingValidation";


export default function MultiBillingPageAdditionalInformation() {
    const [isSaving, setIsSaving] = useState(false);
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error('MultiBillingContext is undefined');
    const { billingdata, setBillingData } = context;

    const {
        billingid,
        patientid
    } = billingdata;
    const { applicationsettings } = useApplicationSettings();
    const branchid = applicationsettings.branchid;
    const { employeeid } = applicationsettings.user;
    const [showReceiptOptionsModal, setShowReceiptOptionsModal] = useState(false);
    const [generatedBillingid, setGeneratedBillingid] = useState<string | undefined>(undefined);
    const [showChoiceModal, setShowChoiceModal] = useState(false);
    const closeReceiptModal = () => setShowReceiptOptionsModal(false);
    const router = useRouter();

    const handleModalClose = () => {
        setShowChoiceModal(false);
        setBillingData(defaultMultiBillingData);
    };

    const checkButtonDisabled = (billingdata: MultiBillingData) => {
        const amountPaid = typeof billingdata.paid === 'number'
            ? billingdata.paid
            : (Array.isArray(billingdata.payments)
                ? billingdata.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
                : 0);
        const amountPayable = Number(billingdata.amountPayable) || 0;
        if (amountPayable === 0 && amountPaid > 0) return true;
        if (amountPayable === 0 && amountPaid === 0) return false;
        if (amountPaid > amountPayable && amountPayable !== 0) return true;
        return amountPaid <= 0 || amountPaid > amountPayable ? true : false;
    };

    

    const handleUserChoice = (choice: string) => {
        setShowChoiceModal(false);
        if (choice === 'print') {
            setShowReceiptOptionsModal(true);
        } else {
            setBillingData(defaultMultiBillingData);
            router.push(`/billing/sales/branches/${plsEncryption(branchid.toString())}`);
        }
    };

    // Helper for billing success
    const handleBillingSuccess = (billingid: string, message?: string) => {
        setGeneratedBillingid(billingid);
        setShowChoiceModal(true);
        setBillingData(defaultMultiBillingData);
    };

    const handleSubmit = async () => {
        if (isSaving) return;
        // Validate payments
        const totalPayments = Array.isArray(billingdata.payments)
            ? billingdata.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
            : 0;
        const amountPayable = Number(billingdata.amountPayable) || 0;
        if (totalPayments !== amountPayable) {
            return;
        }
        try {
            setIsSaving(true);
            // Prepare data for backend, including all required fields
            const dataToBeUploaded = {
                ...billingdata,
                employeeid: employeeid,
                branchid: branchid,
                isConditionsUnderstood: false,
                isPromo:billingdata.isPromo ?? false,
                promoCodeId: billingdata.promoDetails?.id  || billingdata?.promoId,
                promoCode: billingdata.promoDetails?.code || '',
                patientid: Number(patientid),
                payments: billingdata.payments,
                additionalInfo: billingdata.additionalInfo ?? '',
            } as any;
            const method = billingid ? 'PUT' : 'POST';
            const response = await MultiValidateAndSubmitBillingInformation(
                dataToBeUploaded,
                method,
                billingid ? Number(billingid) : undefined
            );
            console.log(response)
            if (!response || typeof response !== 'object') {
                setIsSaving(false);
                return;
            }
            const { status, message, billingid: newBillingId } = response;
            console.log(status)
            if (status === 'pending verification') {
                setIsSaving(false);
                return;
            }
            if (status === true || status === 'success') {
                if (!newBillingId) {
                    setIsSaving(false);
                    return;
                }
                setGeneratedBillingid(newBillingId);
                setShowReceiptOptionsModal(true);
                setIsSaving(false);
                return;
            }
            setIsSaving(false);
        } catch (error) {
            setIsSaving(false);
        }
    };



    return (
        <Row>
            <div>
                <section>
                    <div className="text-sm p-2 pls-color">
                        <div className="form-group">
                            <label className="pls-label text-sm">Payment(s)</label>
                            <MultiPayment
                            />
                            {Array.isArray(billingdata.payments) && billingdata.payments.length > 0 && (
                                <div className="mt-1 small">
                                    Total: <b>{billingdata.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)}</b>
                                    {billingdata.amountPayable && billingdata.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) !== Number(billingdata.amountPayable) && (
                                        <span className="text-danger ms-2">Total must match amount payable</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="mt-2">
                            <label className="pls-label text-sm">Total Payable</label>
                            <div className="fw-bold text-success" style={{ fontSize: '1.1em' }}>
                                {typeof billingdata.amountPayable === 'number'
                                    ? billingdata.amountPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : ''}
                            </div>
                        </div>
                    </div>
                </section>
                <hr />
                 <div className="mb-2">
                        <label htmlFor="additionalInfo" className="form-label fw-bold">Additional Information</label>
                        <textarea
                            id="additionalInfo"
                            className="form-control"
                            rows={2}
                            placeholder="Enter any additional billing notes or information here..."
                            value={billingdata.additionalInfo ?? ''}
                            onChange={e => context.setBillingData({ ...billingdata, additionalInfo: e.target.value })}
                        />
                    </div>
                <div className="mx-2">
                    <div className="mt-2 d-flex justify-content-end">
                        <button
                            disabled={checkButtonDisabled(billingdata)}
                            className="btn btn-success mx-2"
                            onClick={() => { handleSubmit() }}>
                            {isSaving && <Spinner size="sm" />}<RiMoneyDollarCircleLine size={18} /> Bill Client
                        </button>
                        <button
                            onClick={() => {
                                setBillingData(defaultMultiBillingData);
                            }}
                            className="btn btn-danger">
                            <RiCloseLine size={18} /> Cancel
                        </button>
                    </div>
                </div>
            </div>
            {showReceiptOptionsModal && <ReceiptOptionsModal open={showReceiptOptionsModal} close={closeReceiptModal}
                patientid={Number(patientid)}
                billingid={generatedBillingid ? Number(generatedBillingid) : 0} />}
            {showChoiceModal && (
                <Modal 
                    show={showChoiceModal} 
                    onHide={handleModalClose} 
                    centered
                    backdrop="static" 
                    keyboard={false}  
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Billing Complete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>What would you like to do next?</p>
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="primary"
                                onClick={() => handleUserChoice('print')}
                                className="d-flex align-items-center gap-2"
                            >
                                <RiPrinterLine size={18} />
                                Print Receipt
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleUserChoice('sales')}
                                className="d-flex align-items-center gap-2"
                            >
                                <RiStore3Line size={18} />
                                Go to Sales
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
            )}
        </Row>
    );
}
