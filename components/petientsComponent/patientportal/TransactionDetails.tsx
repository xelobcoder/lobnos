import React, { useEffect, useMemo, useState } from 'react';
import styles from './TransactionDetails.module.css';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch, customPost } from '../../Auth/customFetch';
 import { RiCloseLine, RiCalendarLine, RiMoneyDollarCircleLine, RiUserLine ,RiTestTubeLine, RiTruckLine, RiSendPlaneLine, RiInboxArchiveLine } from '@remixicon/react';
import { transactionSummaryBilling } from './TransactionsViewOnly';
import { useApplication } from '../../Auth/useApplicationContext';

interface Witness {
    witnessType: string;
    username: string;
    employeeid: number;
}


interface TransactionDetail {
    serviceid: number;
    billingid: number;
    trackId: number;
    cost: string;
    employeeid: number;
    serviceCategory: string;
    categoryTrackId: number;
    clinicianId: number;
    organizationId: number;
    registrationType: string;
    branchid: number;
    isoutsourced: number;
    outsourceid: null;
    serviceAddedOn: string;
    taxList: null;
    taxValue: string;
    amountIncurredDueTax: string;
    taxIncluded: number;
    discount: string;
    totalcost: string;
    totalpayable: string;
    isNHIS: number;
    isPHIS: number;
    insuranceid: null;
    claimCode: null;
    hasNightAdjustment: number;
    nightAdjustmentValue: string;
    nightAdjustmentMode: string;
    isPackageUsed: number;
    packageid: null;
    isRefundCompleted: number;
    isRefundApproved: number;
    isRefundInitiated: number;
    amountRefunded: string;
    outsourcingOrganization: null;
    name: boolean;
    witnesses: Witness[];
}

interface DeliveryPreference {
    requested_mode: string;
    requested_mode_detail?: string;
    updated_at?: string;
}

interface DeliveryChainResponse {
    attempts?: Array<{ id: number; employeeid: number; username?: string; created_at: string; delivered_mode?: string; notes?: string; failure_notes?: string }>;
    billingid: number;
    handovers: Array<{
        id: number;
        billingid: number;
        patientid: number;
        from_employeeid: number;
        to_employeeid: number;
        status: string;
        notes: string;
        created_at: string;
        from_username?: string;
        from_role?: string;
        to_username?: string;
        to_role?: string;
    }>;
    deliveries: Array<{
        id: number;
        billingid: number;
        patientid: number;
        requested_mode?: string;
        delivered_mode: string;
        delivered_by_employeeid: number;
        delivered_at: string;
        notes?: string;
        delivered_by_username?: string;
        delivered_by_role?: string;
    }>;
}

const deliveryModes = ['whatsapp', 'email', 'hard copy', 'phone call'];

interface TransactionDetailsProps {
    billingId: number;
    onClose: () => void;
    tenantId: number;
    summary: Partial<transactionSummaryBilling> | undefined
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ 
    billingId, 
    onClose,
    summary
}) => {
    const [data, setData] = useState<TransactionDetail[]>([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null);
    const employeeid = useApplication()?.user?.employeeid;
    const [deliveryPreference, setDeliveryPreference] = useState<DeliveryPreference | null>(null);
    const [deliveryChain, setDeliveryChain] = useState<DeliveryChainResponse | null>(null);
    const [loadingDelivery, setLoadingDelivery] = useState(false);
    const [savingDelivery, setSavingDelivery] = useState(false);
    const [savingHandover, setSavingHandover] = useState(false);
    const [deliveryForm, setDeliveryForm] = useState({
        delivered_mode: 'hard copy',
        notes: '',
    });
    const [handoverForm, setHandoverForm] = useState({
        from_employeeid: '',
        to_employeeid: '',
        status: 'handover',
        notes: '',
    });


    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                const response = await customFetch(`billing/information/single?billingid=${billingId}`);
                setData(response.result || []);
            } catch (err) {
                setError('Failed to load transaction details');
                console.error('Error fetching transaction details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [billingId]);

    const patientId = summary?.patientid || null;

    const loadDeliveryContext = async () => {
        setLoadingDelivery(true);
        try {
            const requests: Promise<any>[] = [
                customFetch(`result/delivery/chain/${billingId}`),
                customFetch(`result/delivery/preference/${billingId}`),
            ];
            const [chainResponse, preferenceResponse] = await Promise.all(requests);
            setDeliveryChain({
                billingid: billingId,
                handovers: Array.isArray(chainResponse?.handovers) ? chainResponse.handovers : [],
                deliveries: Array.isArray(chainResponse?.deliveries) ? chainResponse.deliveries : [],
                attempts: Array.isArray(chainResponse?.attempts) ? chainResponse.attempts : [],
            });
            if (preferenceResponse?.preference) {
                setDeliveryPreference(preferenceResponse.preference);
                setDeliveryForm((prev) => ({
                    ...prev,
                    delivered_mode: preferenceResponse.preference.requested_mode || prev.delivered_mode,
                }));
            } else {
                setDeliveryPreference(null);
            }
        } catch (err) {
            console.error('Failed to load delivery chain', err);
            setDeliveryChain({
                billingid: billingId,
                handovers: [],
                deliveries: [],
            });
            setDeliveryPreference(null);
        } finally {
            setLoadingDelivery(false);
        }
    };

    useEffect(() => {
        loadDeliveryContext();
    }, [billingId, patientId]);

    const chainTimeline = useMemo(() => {
        const handovers = (deliveryChain?.handovers || []).map((item) => ({
            id: `handover-${item.id}`,
            type: 'handover',
            when: item.created_at,
            title: `${item.from_username || item.from_employeeid} -> ${item.to_username || item.to_employeeid}`,
            subtitle: item.notes || item.status,
        }));

        const deliveries = (deliveryChain?.attempts?.length ? [] : deliveryChain?.deliveries || []).filter(item => !!item.delivered_mode).map((item) => ({
            id: `delivery-${item.id}`,
            type: 'delivery',
            when: item.delivered_at,
            title: `Delivered via ${item.delivered_mode}`,
            subtitle: item.notes || item.delivered_by_username || '',
        }));

        const attempts = (deliveryChain?.attempts || []).map(item => ({
            id: 'attempt-' + item.id, type: item.failure_notes ? 'failed' : 'delivery', when: item.created_at,
            title: item.failure_notes ? 'Delivery attempt failed' : 'Delivered via ' + item.delivered_mode,
            subtitle: [item.failure_notes || item.notes, item.username || ('Staff #' + item.employeeid)].filter(Boolean).join(' ? '),
        }));
        return [...handovers, ...deliveries, ...attempts].sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
    }, [deliveryChain]);

    const submitDeliveryRecord = async () => {
        if (!employeeid) {
            toast.error('Employee session not found');
            return;
        }
        setSavingDelivery(true);
        try {
            const response: any = await customPost('result/delivery/record', 'POST', {
                billingid: billingId,
                delivered_mode: deliveryForm.delivered_mode,
                delivered_by_employeeid: employeeid,
                notes: deliveryForm.notes,
            });
            if (response?.status === true || response?.success === true) {
                toast.success('Result delivery recorded');
                setDeliveryForm((prev) => ({ ...prev, notes: '' }));
                await loadDeliveryContext();
            } else {
                toast.error(response?.message || 'Failed to record result delivery');
            }
        } catch (err) {
            toast.error('Failed to record result delivery');
        } finally {
            setSavingDelivery(false);
        }
    };

    const submitHandover = async () => {
        if (!handoverForm.from_employeeid || !handoverForm.to_employeeid) {
            toast.error('Both from and to employee IDs are required');
            return;
        }
        setSavingHandover(true);
        try {
            const response: any = await customPost('result/delivery/handover', 'POST', {
                billingid: billingId,
                from_employeeid: Number(handoverForm.from_employeeid),
                to_employeeid: Number(handoverForm.to_employeeid),
                status: handoverForm.status,
                notes: handoverForm.notes,
            });
            if (response?.status === true || response?.success === true) {
                toast.success('Internal handover recorded');
                setHandoverForm({
                    from_employeeid: '',
                    to_employeeid: '',
                    status: 'handover',
                    notes: '',
                });
                await loadDeliveryContext();
            } else {
                toast.error(response?.message || 'Failed to record handover');
            }
        } catch (err) {
            toast.error('Failed to record handover');
        } finally {
            setSavingHandover(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (data.length === 0) return null;
    const transaction = summary

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sidePanel} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                   {transaction &&  <h3>Transaction #{transaction.billingid} Details</h3>}
                    <button onClick={onClose} className={styles.closeButton}>
                        <RiCloseLine size={24} />
                    </button>
                </div>
                
                {transaction && (
                    <div className={styles.content}>
                        <div className="list-group pls-color ">
                            <div className="list-group-item d-flex justify-content-between p-3 align-items-center">
                                <div className="d-flex align-items-center">
                                    <RiMoneyDollarCircleLine size={25} className=" me-3" />
                                    <span className='text-uppercase'>Base Cost</span>
                                </div>
                                <span className="fw-bold text-uppercase">{currencyFormatter.format(parseFloat(transaction?.totalcost?.toString() ?? '0.00'))}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between p-3 align-items-center">
                                <div className="d-flex align-items-center">
                                    <RiCalendarLine size={25} className=" me-3" />
                                    <span className='text-uppercase'>Tax Amount</span>
                                </div>
                                <span className="fw-bold">{transaction.amountIncuredDueTax || '0.00'}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between p-3 align-items-center">
                                <div className="d-flex align-items-center">
                                    <RiMoneyDollarCircleLine size={25} className=" me-3" />
                                    <span className='text-uppercase'>Discount Applied</span>
                                </div>
                                <span className="fw-bold text-uppercase">{transaction.discount || '0.00'}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between p-3 align-items-center">
                                <div className="d-flex align-items-center">
                                    <RiMoneyDollarCircleLine size={25} className=" me-3" />
                                    <span className='text-uppercase'>Total Payable</span>
                                </div>
                                <span className="fw-bold text-uppercase">{transaction.payable}</span>
                            </div>
                        </div>
                    </div>
                )}

                    <div className={styles.section}>
                        <h4><RiMoneyDollarCircleLine size={18} /> Transaction Information</h4>
                        <div className={styles.tableWrapper}>
                            <table className={styles.dataTable}>
                                <thead>
                                    <tr>
                                        <th>Service Category</th>
                                        <th>Name</th>
                                        <th>Cost</th>
                                        <th>Registration Type</th>
                                        <th>Outsourced</th>
                                        <th>Service Added On</th>
                                        <th>Tax Value</th>
                                        <th>Tax Amount</th>
                                        <th>Tax Included</th>
                                        <th>Discount</th>
                                        <th>Total Cost</th>
                                        <th>Total Payable</th>
                                        <th>NHIS</th>
                                        <th>PHIS</th>
                                        <th>Time Based Adjustment</th>
                                        <th>Night Value</th>
                                        <th>Night Mode</th>
                                        <th>Package Used</th>
                                        <th>Refund Status</th>
                                        <th>Amount Refunded</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item.serviceid}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <RiTestTubeLine className="text-primary" size={18} />
                                                    <span>{item.serviceCategory}</span>
                                                </div>
                                            </td>
                                            <td>{item.name}</td>
                                            <td className="fw-semibold text-primary">
                                                {currencyFormatter.format(parseFloat(item.cost))}
                                            </td>
                                            <td>
                                                <span className="badge bg-info-subtle text-info">
                                                    {item.registrationType}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${item.isoutsourced ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
                                                    {item.isoutsourced ? 'Outsourced' : 'In-house'}
                                                </span>
                                            </td>
                                            <td>{new Date(item.serviceAddedOn).toLocaleString()}</td>
                                            <td>{item.taxIncluded ? item.taxValue : '0.00'}</td>
                                            <td>{item.taxIncluded ? currencyFormatter.format(parseFloat(item.amountIncurredDueTax)) : '0.00'}</td>
                                            <td>
                                                <span className={`badge ${item.taxIncluded ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                    {item.taxIncluded ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="text-danger fw-semibold">
                                                {currencyFormatter.format(parseFloat(item.discount))}
                                            </td>
                                            <td className="fw-semibold">
                                                {currencyFormatter.format(parseFloat(item.totalcost))}
                                            </td>
                                            <td className="fw-bold text-primary">
                                                {currencyFormatter.format(parseFloat(item.totalpayable))}
                                            </td>
                                            <td>
                                                <span className={`badge ${item.isNHIS ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'}`}>
                                                    {item.isNHIS ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${item.isPHIS ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'}`}>
                                                    {item.isPHIS ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${item.hasNightAdjustment ? 'bg-info-subtle text-info' : 'bg-secondary-subtle text-secondary'}`}>
                                                    {item.hasNightAdjustment ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>{item.nightAdjustmentValue}</td>
                                            <td>{item.nightAdjustmentMode}</td>
                                            <td>
                                                <span className={`badge ${item.isPackageUsed ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                                    {item.isPackageUsed ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td>
                                                {item.isRefundCompleted ? (
                                                    <span className="badge bg-success-subtle text-success">Completed</span>
                                                ) : item.isRefundApproved ? (
                                                    <span className="badge bg-info-subtle text-info">Approved</span>
                                                ) : item.isRefundInitiated ? (
                                                    <span className="badge bg-warning-subtle text-warning">Initiated</span>
                                                ) : (
                                                    <span className="badge bg-secondary-subtle text-secondary">None</span>
                                                )}
                                            </td>
                                            <td className="text-danger fw-semibold">
                                                {currencyFormatter.format(parseFloat(item.amountRefunded))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h4><RiTruckLine size={18} /> Result Delivery And Handover</h4>

                        <div className="row g-3 mb-3">
                            <div className="col-lg-6">
                                <div className="border rounded p-3 h-100">
                                    <div className="fw-semibold mb-2">Requested Mode (This Transaction)</div>
                                    {(() => {
                                        const fromDelivery = (deliveryChain?.deliveries || []).find((d) => !!d.requested_mode);
                                        if (fromDelivery?.requested_mode) {
                                            return (
                                                <>
                                                    <div className="text-capitalize">{fromDelivery.requested_mode}</div>
                                                    <div className="text-muted small">Captured for this billing during delivery logging.</div>
                                                </>
                                            );
                                        }
                                        if (deliveryPreference) {
                                            return (
                                                <>
                                                    <div className="text-capitalize">{deliveryPreference.requested_mode}</div>
                                                    <div className="text-muted small">{deliveryPreference.requested_mode_detail || 'No extra instruction'}</div>
                                                    {deliveryPreference.updated_at ? (
                                                        <div className="text-muted small mt-1">Last saved {new Date(deliveryPreference.updated_at).toLocaleString()}</div>
                                                    ) : null}
                                                    <div className="text-muted small mt-2">
                                                        This can change per transaction. Set it during billing.
                                                    </div>
                                                </>
                                            );
                                        }
                                        return <div className="text-muted small">No requested mode recorded yet for this billing.</div>;
                                    })()}
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="border rounded p-3 h-100">
                                    <div className="fw-semibold mb-2">Record Final Delivery</div>
                                    <div className="mb-2">
                                        <label className="form-label small text-muted mb-1">Delivered Mode</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={deliveryForm.delivered_mode}
                                            onChange={(e) => setDeliveryForm((prev) => ({ ...prev, delivered_mode: e.target.value }))}
                                        >
                                            {deliveryModes.map((mode) => (
                                                <option key={mode} value={mode}>{mode}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small text-muted mb-1">Notes</label>
                                        <textarea
                                            className="form-control form-control-sm"
                                            rows={3}
                                            value={deliveryForm.notes}
                                            onChange={(e) => setDeliveryForm((prev) => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Delivered after ID confirmation, email sent, etc."
                                        />
                                    </div>
                                    <button type="button" className="btn btn-sm btn-primary" onClick={submitDeliveryRecord} disabled={savingDelivery}>
                                        {savingDelivery ? 'Saving...' : 'Record Delivery'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-12">
                                <div className="border rounded p-3">
                                    <div className="fw-semibold mb-2">Record Internal Handover</div>
                                    <div className="row g-2">
                                        <div className="col-md-3">
                                            <label className="form-label small text-muted mb-1">From Employee ID</label>
                                            <input
                                                className="form-control form-control-sm"
                                                value={handoverForm.from_employeeid}
                                                onChange={(e) => setHandoverForm((prev) => ({ ...prev, from_employeeid: e.target.value }))}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label small text-muted mb-1">To Employee ID</label>
                                            <input
                                                className="form-control form-control-sm"
                                                value={handoverForm.to_employeeid}
                                                onChange={(e) => setHandoverForm((prev) => ({ ...prev, to_employeeid: e.target.value }))}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label small text-muted mb-1">Status</label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={handoverForm.status}
                                                onChange={(e) => setHandoverForm((prev) => ({ ...prev, status: e.target.value }))}
                                            >
                                                <option value="handover">handover</option>
                                                <option value="received">received</option>
                                                <option value="returned">returned</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label small text-muted mb-1">Notes</label>
                                            <input
                                                className="form-control form-control-sm"
                                                value={handoverForm.notes}
                                                onChange={(e) => setHandoverForm((prev) => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Validated and handed over"
                                            />
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-sm btn-outline-primary mt-3" onClick={submitHandover} disabled={savingHandover}>
                                        {savingHandover ? 'Saving...' : 'Record Handover'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded p-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="fw-semibold">Delivery Timeline</div>
                                {loadingDelivery ? <div className="text-muted small">Loading...</div> : null}
                            </div>

                            {chainTimeline.length === 0 ? (
                                <div className="text-muted small">No handover or delivery records found for this billing ID.</div>
                            ) : (
                                <div className="d-grid gap-2">
                                    {chainTimeline.map((item) => (
                                        <div key={item.id} className="border rounded p-2">
                                            <div className="d-flex justify-content-between align-items-start gap-2">
                                                <div className="d-flex align-items-start gap-2">
                                                    <span className={`mt-1 ${item.type === 'failed' ? 'text-danger' : item.type === 'delivery' ? 'text-success' : 'text-primary'}`}>
                                                        {item.type === 'delivery' ? <RiSendPlaneLine size={16} /> : <RiInboxArchiveLine size={16} />}
                                                    </span>
                                                    <div>
                                                        <div className="fw-semibold">{item.title}</div>
                                                        <div className="text-muted small">{item.subtitle || 'No note provided'}</div>
                                                    </div>
                                                </div>
                                                <small className="text-muted">{new Date(item.when).toLocaleString()}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default TransactionDetails;
