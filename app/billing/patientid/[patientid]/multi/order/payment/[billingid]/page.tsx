'use client';
import { useParams } from "next/navigation";
import { Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import { plsDecryption } from "../../../../../../../../lib/encryption";
import BillingPagePatientInformation from "../../../../../../../../components/Billing/BillingContextComponents/PersonalInfoView";
import { fetchPreviousBilledRecords, getTransactionPreviousBillingRecords } from "../../../../../../../../lib/billingLib";
import { customFetch, reactSelectCustomStyles } from "../../../../../../../../components/Auth/customFetch";
import Select from 'react-select';
import { Button } from "react-bootstrap";

type Payment = {
    mode: string;
    amount: number;
};


export default function MultiPaymentPage() {
    const [patientInformation, setPatientInformation] = useState<any>(null);
    const [previousRecords, setPreviousRecords] = useState<any[]>([]);
    const [transactionRecords, setTransactionRecords] = useState<any[]>([]);
    const [paymentModes, setPaymentModes] = useState<any[]>([]);
    // Payment UI state
    const [paymentMode, setPaymentMode] = useState<'all' | 'some'>('all');
    const [payAllPayments, setPayAllPayments] = useState([{ mode: '', amount: 0 }]);
    const [payAllError, setPayAllError] = useState('');
    const [perItemPayments, setPerItemPayments] = useState<any[]>([]); // [{amount, mode}]
    const [selectedItems, setSelectedItems] = useState<boolean[]>([]);
    const [perItemError, setPerItemError] = useState('');
    // For service items
    const [serviceItems, setServiceItems] = useState<any[]>([]); // [{id, name, maxAmount}]
    // For legacy single payment
    const [newPayment, setNewPayment] = useState<Payment>({ mode: '', amount: 0 });
    const [payments, setPayments] = useState<Payment[]>([]);
    const [validationError, setValidationError] = useState('');
    const params = useParams();
    const undeCryptedPatientId = params?.patientid;
    const patientid = undeCryptedPatientId ? plsDecryption(undeCryptedPatientId.toString()) : undefined;
    const billingid = params?.billingid;

    useEffect(() => {
        const fetchAll = async () => {
            if (patientid && billingid) {
                const [personalInfoRes, previousRecordsRes, transactionRes, paymentModesRes] = await Promise.all([
                    customFetch(`register/personalinformation?patientid=${patientid}`),
                    fetchPreviousBilledRecords(billingid),
                    getTransactionPreviousBillingRecords(Number(billingid)),
                    customFetch('paymentmodes')
                ]);
                setPatientInformation(personalInfoRes?.result || null);
                setPreviousRecords(previousRecordsRes || []);
                setTransactionRecords(transactionRes?.result || []);
                const modes = paymentModesRes?.result || paymentModesRes?.data || [];
                setPaymentModes(modes);
            }
        };
        fetchAll();
    }, [patientid, billingid]);

    const availableModes = paymentModes.map(mode => ({
        value: mode.KeyID || mode.id,
        label: mode.PaymentMode || mode.name
    }));

    // Calculate payable and build service items for per-item payment
    const payable = transactionRecords.reduce((sum, rec) => sum + (rec.payable || 0), 0);
    useEffect(() => {
        // Build serviceItems from transactionRecords
        let items: any[] = [];
        transactionRecords.forEach(rec => {
            if (rec.services && Array.isArray(rec.services)) {
                rec.services.forEach((svc: any) => {
                    items.push({
                        id: svc.id || svc.keyid || svc.KeyID,
                        name: svc.name || svc.serviceName || svc.ServiceName,
                        maxAmount: svc.discountedValue || svc.amount || svc.payable || 0
                    });
                });
            }
        });
        setServiceItems(items);
        setPerItemPayments(items.map(() => ({ amount: '', mode: '' })));
        setSelectedItems(items.map(() => false));
    }, [transactionRecords]);

    const handleAddPayment = () => {
        if (!newPayment.mode || newPayment.amount <= 0) {
            setValidationError('Please select a payment mode and enter a valid amount.');
            return;
        }
        setValidationError('');
        setPayments(ps => [...ps, newPayment]);
        setNewPayment({ mode: '', amount: 0 });
    };

    // Handlers for Pay All
    const handlePayAllPaymentChange = (idx: number, field: 'mode' | 'amount', value: any) => {
        setPayAllPayments(arr => arr.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    };
    const handleRemovePayAllPayment = (idx: number) => {
        setPayAllPayments(arr => arr.length > 1 ? arr.filter((_, i) => i !== idx) : arr);
    };
    const handleAddPayAllPaymentRow = () => {
        setPayAllPayments(arr => [...arr, { mode: '', amount: 0 }]);
    };

    // Handlers for Pay Some
    const handleSelectItem = (idx: number) => {
        setSelectedItems(arr => arr.map((v, i) => i === idx ? !v : v));
    };
    const handlePerItemPaymentChange = (idx: number, field: 'mode' | 'amount', value: any) => {
        setPerItemPayments(arr => arr.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    };

if (!patientid || !billingid) {
    return (
        <div className="alert alert-danger">
            Invalid or missing patient ID or billing ID.
            {/* Render payment modes if needed */}
            {paymentModes && paymentModes.length > 0 && (
                <div className="mt-3">
                    <h5>Available Payment Modes</h5>
                    <ul>
                        {paymentModes.map((mode: any) => (
                            <li key={mode.KeyID || mode.id}>{mode.PaymentMode || mode.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

    return (
        <div className="container-fluid">
            <div className="col-12 bg-white p-2">
                <BillingPagePatientInformation data={patientInformation} />
                {/* ...existing code... */}
                {/* Payment Entry UI (Pay All / Pay Some) */}
                <div className="mt-4">
                    <h5>Enter Payment</h5>
                    {/* Payment Mode Toggle */}
                    <div style={{ margin: '16px 0', display: 'flex', gap: 24, alignItems: 'center' }}>
                        <label style={{ fontWeight: 500, cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="paymentMode"
                                checked={paymentMode === 'all'}
                                onChange={() => setPaymentMode('all')}
                                style={{ marginRight: 6 }}
                            />
                            Pay All
                        </label>
                        <label style={{ fontWeight: 500, cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="paymentMode"
                                checked={paymentMode === 'some'}
                                onChange={() => setPaymentMode('some')}
                                style={{ marginRight: 6 }}
                            />
                            Pay Some
                        </label>
                    </div>

                    {/* Pay All Mode: Multiple Payment Modes */}
                    {paymentMode === 'all' && (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8, fontWeight: 500 }}>Add Payment(s):</div>
                            <table className="table table-sm align-middle" style={{ border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', marginBottom: 8 }}>
                                <thead style={{ background: '#f5f5f5', fontWeight: 600 }}>
                                    <tr>
                                        <th style={{ width: 40 }}>#</th>
                                        <th>Payment Mode</th>
                                        <th style={{ width: 120 }}>Amount</th>
                                        <th style={{ width: 60 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payAllPayments.map((p, idx) => (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td style={{ minWidth: 180 }}>
                                                <Select
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    value={availableModes.find(opt => opt.value === p.mode) || null}
                                                    onChange={opt => handlePayAllPaymentChange(idx, 'mode', opt ? opt.value : '')}
                                                    options={availableModes}
                                                    placeholder="Select payment mode"
                                                    styles={reactSelectCustomStyles}
                                                    isClearable
                                                    menuPlacement="auto"
                                                    menuPosition="fixed"
                                                    maxMenuHeight={180}
                                                    isDisabled={availableModes.length === 0}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    style={{ width: 110 }}
                                                    value={p.amount}
                                                    min={0}
                                                    max={(() => {
                                                        const otherPaymentsTotal = payAllPayments.reduce((sum, payment, i) => 
                                                            i !== idx ? sum + Number(payment.amount || 0) : sum, 0);
                                                        return Math.max(0, payable - otherPaymentsTotal);
                                                    })()}
                                                    onChange={e => {
                                                        let val = Number(e.target.value);
                                                        const otherPaymentsTotal = payAllPayments.reduce((sum, payment, i) => 
                                                            i !== idx ? sum + Number(payment.amount || 0) : sum, 0);
                                                        const maxAllowed = Math.max(0, payable - otherPaymentsTotal);
                                                        if (val > maxAllowed) val = maxAllowed;
                                                        handlePayAllPaymentChange(idx, 'amount', val);
                                                    }}
                                                    placeholder={(() => {
                                                        const otherPaymentsTotal = payAllPayments.reduce((sum, payment, i) => 
                                                            i !== idx ? sum + Number(payment.amount || 0) : sum, 0);
                                                        const maxAllowed = Math.max(0, payable - otherPaymentsTotal);
                                                        return `Max: ${maxAllowed.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                                                    })()}
                                                />
                                            </td>
                                            <td>
                                                {payAllPayments.length > 1 && (
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleRemovePayAllPayment(idx)}>
                                                        ×
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Button variant="outline-primary" size="sm" onClick={handleAddPayAllPaymentRow}>
                                + Add Payment
                            </Button>
                            <div style={{ fontSize: 13, color: 'gray', marginTop: 8 }}>
                                Total Entered: {payAllPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} / {payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                <br />
                                <span style={{ fontWeight: 600, color: payAllPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0) === payable ? '#28a745' : '#dc3545' }}>
                                    {payAllPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0) === payable ? '✓ Full amount entered' : '⚠ Must pay full amount'}
                                </span>
                            </div>
                            {payAllError && <div className="text-danger small">{payAllError}</div>}
                        </div>
                    )}

                    {/* Pay Some Mode: Per-item selection and allocation */}
                    {paymentMode === 'some' && (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8, fontWeight: 500 }}>Select Items to Pay:</div>
                            <table className="table table-sm align-middle" style={{ border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff' }}>
                                <thead style={{ background: '#f5f5f5', fontWeight: 600 }}>
                                    <tr>
                                        <th style={{ width: 60, textAlign: 'center' }}>Select</th>
                                        <th>Item</th>
                                        <th style={{ width: 120 }}>Amount</th>
                                        <th style={{ width: 180 }}>Payment Mode</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceItems.map((item, idx) => (
                                        <tr key={item.id}>
                                            <td style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems[idx]}
                                                    onChange={() => handleSelectItem(idx)}
                                                />
                                            </td>
                                            <td>{item.name}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    style={{ width: 110 }}
                                                    value={perItemPayments[idx].amount}
                                                    min={0}
                                                    max={item.maxAmount}
                                                    disabled={!selectedItems[idx]}
                                                    onChange={e => handlePerItemPaymentChange(idx, 'amount', Number(e.target.value))}
                                                />
                                            </td>
                                            <td>
                                                <Select
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    value={availableModes.find(opt => opt.value === perItemPayments[idx].mode) || null}
                                                    onChange={opt => handlePerItemPaymentChange(idx, 'mode', opt ? opt.value : '')}
                                                    options={availableModes}
                                                    placeholder="Select payment mode"
                                                    styles={reactSelectCustomStyles}
                                                    isClearable
                                                    menuPlacement="auto"
                                                    menuPosition="fixed"
                                                    maxMenuHeight={180}
                                                    isDisabled={!selectedItems[idx] || availableModes.length === 0}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ fontSize: 13, color: 'gray', marginTop: 8 }}>
                                Selected Total: {perItemPayments.reduce((sum, p, idx) => selectedItems[idx] ? sum + Number(p.amount || 0) : sum, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            {perItemError && <div className="text-danger small">{perItemError}</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}