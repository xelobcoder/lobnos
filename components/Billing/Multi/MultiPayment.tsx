import React, { useState, useContext } from "react";
import Select from "react-select";
import { Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { MultiBillingContext } from "./MultiBillingContext";
import { calculateCorrectionalAdjustment } from '../../../lib/Multi/correctionUtils';

interface PaymentModeOption {
    value: string | number;
    label: string;
}

interface PaymentEntry {
    mode: string | number;
    amount: number;
}

const MultiPayment: React.FC = () => {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, setBillingData } = context;
    const payments = billingdata.payments || [];
    const paymentModes: PaymentModeOption[] = Array.isArray(billingdata.paymentModes)
        ? billingdata.paymentModes.map((item: any) => ({ value: item.KeyID, label: item.PaymentMode }))
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

    const usedModes = new Set(payments.map(p => p.mode));
    const availableModes: PaymentModeOption[] = paymentModes.filter(mode => !usedModes.has(mode.value));

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
        const updatedPayments = [...payments, { mode: newPayment.mode, amount }];
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
    if (isCorrection) {
        if (correctionDiff < 0) {
            return <div className="alert alert-info">No payment required. Previous paid amount ({previousPaid.toFixed(2)}) exceeds new payable ({payable.toFixed(2)}). Excess: {(Math.abs(correctionDiff)).toFixed(2)}</div>;
        }
        if (correctionDiff === 0) {
            return <div className="alert alert-info">No payment required. Previous paid amount matches new payable.</div>;
        }
    }
    if (payments.length === 0 && availableModes.length === 0) {
        return <div className="alert alert-warning">No payments made and no payment modes available</div>;
    }
    
    return (
        <div className="form-group">
            <label className="pls-label text-sm">Payment List(Valid for current Transaction)</label>
            
            <table className="table table-bordered table-sm">
                <thead>
                    <tr>
                        <th>Payment Mode</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(payments) && payments.map((p, idx) => {
                        const modeLabel = paymentModes.find(opt => opt.value === p.mode)?.label || 'Unknown';
                        return (
                            <tr key={`${p.mode}-${idx}`}>
                                <td>{modeLabel}</td>
                                <td>{p.amount.toFixed(2)}</td>
                                <td>
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Remove payment</Tooltip>}
                                    >
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            onClick={() => {
                                                const updatedPayments = payments.filter((_, i) => i !== idx);
                                                const totalPaid = updatedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
                                                const newBalance = Math.round((payable - totalPaid) * 100) / 100;
                                                setBillingData({ ...billingdata, payments: updatedPayments, paid: totalPaid, balance: newBalance });
                                            }}
                                            aria-label={`Remove ${modeLabel} payment`}
                                        >
                                            <span aria-hidden="true">🗑️</span>
                                        </Button>
                                    </OverlayTrigger>
                                </td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td style={{ minWidth: 150 }}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                value={availableModes.find(opt => opt.value === newPayment.mode) || null}
                                onChange={opt => setNewPayment(np => ({ 
                                    ...np, 
                                    mode: opt ? opt.value : '' 
                                }))}
                                options={availableModes}
                                placeholder="Select..."
                                isDisabled={availableModes.length === 0}
                            />
                        </td>
                        <td style={{ minWidth: 100 }}>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={newPayment.amount}
                                min={0}
                                max={remainingAmount}
                                onChange={handleAmountChange}
                                inputMode="decimal"
                                step="0.01"
                                placeholder="0.00"
                                disabled={availableModes.length === 0}
                            />
                        </td>
                        <td>
                            <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Add payment</Tooltip>}
                            >
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    onClick={handleAdd}
                                    disabled={availableModes.length === 0 || !newPayment.amount}
                                    aria-label="Add payment"
                                >
                                    <span aria-hidden="true">➕</span>
                                </Button>
                            </OverlayTrigger>
                        </td>
                    </tr>
                </tbody>
            </table>

            {validationError && (
                <div className="text-danger small mt-1">{validationError}</div>
            )}
            <div className="mt-1 small">
                {isCorrection ? (
                    <div className="card border-info mb-2" style={{ maxWidth: 420 }}>
                        <div className="card-header bg-info text-white py-1 px-2" style={{ fontWeight: 600, fontSize: '1em' }}>
                            Correctional Adjustment Summary
                        </div>
                        <div className="card-body p-2">
                            <table className="table table-bordered table-sm mb-1" style={{ background: '#f8f9fa' }}>
                                <tbody>
                                    <tr>
                                        <th>Previous Paid</th>
                                        <td className="text-end">{previousPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr>
                                        <th>New Payable</th>
                                        <td className="text-end">{payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr>
                                        <th>Correctional Difference</th>
                                        <td className={correctionDiff > 0 ? 'text-danger fw-bold text-end' : correctionDiff < 0 ? 'text-success fw-bold text-end' : 'text-end'}>
                                            {correctionDiff > 0 && '+'}{correctionDiff.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Total Paid This Correction</th>
                                        <td className="text-end">{currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} / {correctionDiff.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </tbody>
                            </table>
                            {correctionDiff > 0 && (
                                <div className="text-danger fw-bold">
                                    {currentTotal < correctionDiff
                                        ? <>Outstanding: {(correctionDiff - currentTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</>
                                        : currentTotal > correctionDiff
                                            ? <>Excess: {(currentTotal - correctionDiff).toLocaleString(undefined, { minimumFractionDigits: 2 })}</>
                                            : <span className="text-success">Correctional payment complete.</span>
                                    }
                                </div>
                            )}
                            {correctionDiff === 0 && (
                                <div className="text-info">No payment required. Previous paid matches new payable.</div>
                            )}
                            {correctionDiff < 0 && (
                                <div className="text-success">No payment required. Previous paid exceeds new payable. Excess: {Math.abs(correctionDiff).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="card border-secondary mb-2" style={{ maxWidth: 420 }}>
                        <div className="card-header bg-secondary text-white py-1 px-2" style={{ fontWeight: 600, fontSize: '1em' }}>
                            Payment Summary
                        </div>
                        <div className="card-body p-2">
                            <table className="table table-bordered table-sm mb-1" style={{ background: '#f8f9fa' }}>
                                <tbody>
                                    <tr>
                                        <th>Total Paid</th>
                                        <td className="text-end">{currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} / {payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </tbody>
                            </table>
                            {currentTotal !== payable && (
                                <div className="text-danger fw-bold">
                                    Remaining: {(payable - currentTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {availableModes.length === 0 && payments.length > 0 && (
                <div className="text-warning small mt-1">
                    All available payment modes have been used
                </div>
            )}
        </div>
    );
}

export default MultiPayment;