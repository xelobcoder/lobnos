import React, { useState, useContext } from "react";
import Select from "react-select";
import { Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { MultiBillingContext } from "./MultiBillingContext";

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

    const [newPayment, setNewPayment] = useState<Omit<PaymentEntry, 'amount'> & { amount: string }>({ 
        mode: '', 
        amount: '' 
    });
    const [validationError, setValidationError] = useState('');

    const currentTotal = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = payable - currentTotal;
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
        if (amount > roundedRemaining + 0.0001) {
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
        const remaining = Math.round((payable - payments.reduce((sum, p) => sum + p.amount, 0)) * 100) / 100;
        if (numValue > remaining) {
            setNewPayment(np => ({ ...np, amount: remaining.toFixed(2) }));
            return;
        }
        setNewPayment(np => ({ ...np, amount: value }));
    };

    if (!paymentModes || paymentModes.length === 0) {
        return <div className="alert alert-warning">No payment modes available</div>;
    }
    if (payable <= 0) {
        return <div className="alert alert-warning">Nothing to pay</div>;
    }
    if (payments.length === 0 && availableModes.length === 0) {
        return <div className="alert alert-warning">No payments made and no payment modes available</div>;
    }
    
    return (
        <div className="form-group">
            <label className="pls-label text-sm">Payment List</label>
            
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
                Total: <b>{currentTotal.toFixed(2)}</b> / {payable.toFixed(2)}
                {currentTotal !== payable && (
                    <span className="text-danger ms-2">
                        Remaining: {(payable - currentTotal).toFixed(2)}
                    </span>
                )}
            </div>
            {availableModes.length === 0 && payments.length > 0 && (
                <div className="text-warning small mt-1">
                    All available payment modes have been used
                </div>
            )}
        </div>
    );
};

export default MultiPayment;