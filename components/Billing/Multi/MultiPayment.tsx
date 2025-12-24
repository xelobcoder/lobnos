import React, { useState, useContext } from "react";
import { Button } from "react-bootstrap";
import { MultiBillingContext } from "./MultiBillingContext";
import PaymentModal from "./PaymentModal";
import { calculateCorrectionalAdjustment } from "../../../lib/Multi/correctionUtils";
import { MultiBillingData } from "../../../lib/Multi/MultiTypes";

interface PaymentModeOption {
    value: string | number;
    label: string;
}

interface PaymentEntry {
    mode: string | number;
    amount: number;
}


interface MultiPaymentProps {
    handlesubmit?: (data: MultiBillingData) => void;
}

const MultiPayment: React.FC<MultiPaymentProps> = ({ handlesubmit }) => {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, setBillingData } = context;
    const payments = billingdata.payments || [];
    const paymentModes: PaymentModeOption[] = Array.isArray(billingdata.paymentModes)
        ? billingdata.paymentModes.map((item: any) => ({
            value: String(item.KeyID ?? item.id ?? item.value ?? item.PaymentMode ?? item.name),
            label: item.PaymentMode ?? item.name ?? item.label ?? String(item.KeyID ?? item.id ?? item.value ?? '')
        }))
        : [];
    const payable = Number(billingdata.amountPayable) || 0;
    const isAdjustment = String(billingdata.isAdjustment) === '1' || String(billingdata.isAdjustment) === 'true';
    const adjustmentType = billingdata.adjustmentType;
    const isCorrection = isAdjustment && adjustmentType === 'correction';
    const currentTotal = payments.reduce((sum, p) => sum + p.amount, 0);
    const correctional = isCorrection ? calculateCorrectionalAdjustment(billingdata) : null;
    const previousPaid = correctional ? correctional.previousPaid : 0;
    const correctionDiff = correctional ? correctional.currentPayable - correctional.previousPaid : 0;
    const remainingAmount = isCorrection ? Math.max(0, correctionDiff - currentTotal) : payable - currentTotal;

    const [newPayment, setNewPayment] = useState<Omit<PaymentEntry, 'amount'> & { amount: string }>({
        mode: '',
        amount: ''
    });
    const [validationError, setValidationError] = useState('');
    const usedModes = new Set(payments.map(p => String(p.mode)));
    const availableModes: PaymentModeOption[] = paymentModes.filter(opt => !usedModes.has(String(opt.value)));

    const handleAdd = () => {
        setValidationError('');
        if (!newPayment.mode) {
            setValidationError('Please select a payment mode');
            return;
        }
        const amount = Math.round(parseFloat(newPayment.amount) * 100) / 100;
        const roundedRemaining = Math.round(remainingAmount * 100) / 100;
        if (isNaN(amount) || amount <= 0) {
            setValidationError('Please enter a valid positive amount');
            return;
        }
        if (isCorrection && amount > roundedRemaining + 0.0001) {
            setValidationError(`Amount cannot exceed correctional difference (${roundedRemaining.toFixed(2)})`);
            return;
        }
        if (!isCorrection && amount > roundedRemaining + 0.0001) {
            setValidationError(`Amount cannot exceed remaining payable (${roundedRemaining.toFixed(2)})`);
            return;
        }
        const updatedPayments = [...payments, { mode: String(newPayment.mode), amount }];
        const totalPaid = updatedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const newBalance = Math.round((payable - totalPaid) * 100) / 100;
        setBillingData({ ...billingdata, payments: updatedPayments, paid: totalPaid, balance: newBalance });
        setNewPayment({ mode: '', amount: '' });
    };


    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (value === '') {
            setNewPayment(np => ({ ...np, amount: '' }));
            return;
        }
        if (!/^\d*(\.\d{0,2})?$/.test(value)) {
            return;
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return;
        }
        if (numValue < 0) {
            setNewPayment(np => ({ ...np, amount: '0' }));
            return;
        }
        const remaining = isCorrection ? Math.max(0, correctionDiff - payments.reduce((sum, p) => sum + p.amount, 0)) : Math.round((payable - payments.reduce((sum, p) => sum + p.amount, 0)) * 100) / 100;
        if (numValue > remaining) {
            setNewPayment(np => ({ ...np, amount: remaining.toFixed(2) }));
            return;
        }
        setNewPayment(np => ({ ...np, amount: value }));
    };

    if (!paymentModes || paymentModes.length === 0) {
        return <div className="alert alert-warning">No payment modes available</div>;
    }

    let earlyReturn: React.ReactNode = null;
    if (isCorrection) {
        if (correctionDiff < 0) {
            earlyReturn = <div className="alert alert-info">No payment required. Previous paid amount ({previousPaid.toFixed(2)}) exceeds new payable ({payable.toFixed(2)}). Excess: {(Math.abs(correctionDiff)).toFixed(2)}</div>;
        } else if (correctionDiff === 0) {
            earlyReturn = <div className="alert alert-info">No payment required. Previous paid amount matches new payable.</div>;
        }
    }
    if (!earlyReturn && payments.length === 0 && availableModes.length === 0) {
        earlyReturn = <div className="alert alert-warning">No payments made and no payment modes available</div>;
    }


    if (earlyReturn) {
        return earlyReturn;
    }



    return (
        <React.Fragment>
            <PaymentModal
                show={billingdata.openPaymentModal == 2}
                onHide={() =>  {
                    if (billingdata.openPaymentModal === 2 || billingdata.openPaymentModal === 4) {
                        setBillingData(prev => ({ ...prev, openPaymentModal: 0 }));
                    }
                }}
                handlesubmit={handlesubmit}
                payments={payments}
                availableModes={availableModes}
                payable={payable}
                setNewPayment={setNewPayment}
                setBillingData={setBillingData}
                billingdata={billingdata}
            />
        </React.Fragment>
    );
}
export default MultiPayment