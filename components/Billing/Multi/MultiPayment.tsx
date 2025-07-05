import React, { useState, useContext } from "react";
import Select from "react-select";
import { Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { MultiBillingContext } from "./MultiBillingContext";
import { calculateCorrectionalAdjustment } from '../../../lib/Multi/correctionUtils';
import styles from '.././../../styles/SmsTemplateList.module.css'
import { currencyFormatter, reactSelectCustomStyles } from "../../Auth/customFetch";

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
    // Fix: Support both KeyID/PaymentMode and id/name for paymentModes
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
            <label className="pls-label text-sm mb-2" style={{ fontWeight: 600, fontSize: '1.1em', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 20, marginRight: 8 }}>💳</span>
                Payment List (Valid for current Transaction)
            </label>
            <div className="">
                                <div>
                    {validationError && (
                        <div className="text-danger small mt-1">{validationError}</div>
                    )}
                    <div className="mt-1 small">
                        {isCorrection ? (
                            <div className="card border-info mb-2" >
                                <div className="card-header bg-info text-white py-1 px-2" style={{ fontWeight: 600, fontSize: '1em' }}>
                                    Correctional Adjustment Summary
                                </div>
                                <div className="card-body p-2">
                                    <table className={styles.table} style={{ background: '#f8f9fa' }}>
                                        <tbody>
                                            <tr>
                                                <th>Previous Paid</th>
                                                <td className="text-end">{currencyFormatter.format(previousPaid)}</td>
                                            </tr>
                                            <tr>
                                                <th>New Payable</th>
                                                <td className="text-end">{currencyFormatter.format(payable)}</td>
                                            </tr>
                                            <tr>
                                                <th>Correctional Difference</th>
                                                <td className={correctionDiff > 0 ? 'text-danger fw-bold text-end' : correctionDiff < 0 ? 'text-success fw-bold text-end' : 'text-end'}>
                                                    {correctionDiff > 0 && '+'}{currencyFormatter.format(correctionDiff)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Total Paid This Correction</th>
                                                <td className="text-end">{currentTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} / {correctionDiff.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    {correctionDiff > 0 && (
                                        <div className="d-flex  justify-content-end mt-2">
                                            {currentTotal < correctionDiff ? (
                                                <span className="badge bg-danger px-3 py-2" style={{ fontSize: '1.1em', borderRadius: 8, fontWeight: 600 }}>
                                                    <span style={{ fontSize: 18, marginRight: 6 }}>⏳</span>
                                                    Outstanding: <span style={{ color: '#fff', fontWeight: 700 }}>{(correctionDiff - currentTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </span>
                                            ) : currentTotal > correctionDiff ? (
                                                <span className="badge bg-success px-3 py-2" style={{ fontSize: '1.1em', borderRadius: 8, fontWeight: 600 }}>
                                                    <span style={{ fontSize: 18, marginRight: 6 }}>💰</span>
                                                    Excess: <span style={{ color: '#fff', fontWeight: 700 }}>{(currentTotal - correctionDiff).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </span>
                                            ) : (
                                                <span className="badge bg-primary px-3 py-2" style={{ fontSize: '1.1em', borderRadius: 8, fontWeight: 600 }}>
                                                    <span style={{ fontSize: 18, marginRight: 6 }}>✅</span>
                                                    Correctional payment complete.
                                                </span>
                                            )}
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
                </div>
                <div>
                    <table className="table table-striped table-hover " >
                        <thead className="table-light">
                            <tr>
                                <th style={{ minWidth: 120 }}>Payment Mode</th>
                                <th style={{ minWidth: 100 }}>Amount</th>
                                <th style={{ minWidth: 80 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(payments) && payments.map((p, idx) => {
                                const modeLabel = paymentModes.find(opt => opt.value === String(p.mode))?.label || 'Unknown';
                                return (
                                    <tr key={`${p.mode}-${idx}`} style={{ verticalAlign: 'middle' }}>
                                        <td>{modeLabel}</td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>
                                                {Number(p.amount).toLocaleString(undefined, { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td>
                                            <OverlayTrigger placement="top" overlay={<Tooltip>Remove payment</Tooltip>}>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    style={{ borderRadius: 20, padding: '2px 10px' }}
                                                    onClick={() => {
                                                        const updatedPayments = payments.filter((_, i) => i !== idx).map(pmt => ({ ...pmt, mode: String(pmt.mode) }));
                                                        const totalPaid = updatedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
                                                        const newBalance = Math.round((payable - totalPaid) * 100) / 100;
                                                        setBillingData({ ...billingdata, payments: updatedPayments, paid: totalPaid, balance: newBalance });
                                                    }}
                                                    aria-label={`Remove ${modeLabel} payment`}
                                                >
                                                    <span aria-hidden="true" style={{ fontSize: 18 }}>🗑️</span>
                                                </Button>
                                            </OverlayTrigger>
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr style={{ background: '#f6f8fa' }}>
                                <td style={{ padding: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Select
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            value={availableModes.find(opt => opt.value === newPayment.mode) || null}
                                            onChange={opt => setNewPayment(np => ({
                                                ...np,
                                                mode: opt ? opt.value : ''
                                            }))}
                                            options={availableModes}
                                            placeholder="Select payment mode..."
                                            styles={reactSelectCustomStyles}
                                            isDisabled={availableModes.length === 0}
                                        />
                                    </div>
                                </td>
                                <td style={{ minWidth: 120, padding: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ fontWeight: 600, color: '#888' }}>&#8373;</span>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            style={{ borderRadius: 8, border: '1px solid #d9d9d9', width: 90 }}
                                            value={newPayment.amount}
                                            min={0}
                                            max={remainingAmount}
                                            onChange={handleAmountChange}
                                            inputMode="decimal"
                                            step="0.01"
                                            placeholder="0.00"
                                            disabled={availableModes.length === 0}
                                        />
                                    </div>
                                </td>
                                <td style={{ padding: 8 }}>
                                    <OverlayTrigger placement="top" overlay={<Tooltip>Add payment</Tooltip>}>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            style={{ borderRadius: 20, fontWeight: 600, fontSize: 18, padding: '2px 14px' }}
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
                        <div className="alert alert-danger mt-2 py-1 px-2" style={{ fontSize: 13, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 18 }}>⚠️</span> {validationError}
                        </div>
                    )}
                    {availableModes.length === 0 && (
                        <div className="alert alert-warning mt-2 py-1 px-2" style={{ fontSize: 13, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 18 }}>ℹ️</span> All available payment modes have been used
                        </div>
                    )}
                </div>
                <div className="col-2">
                    {availableModes.length === 0 && payments.length > 0 && (
                        <div className="text-warning small mt-1">
                            All available payment modes have been used
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MultiPayment;