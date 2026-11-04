import { Card, Form, Button, Spinner, Modal } from "react-bootstrap";
import { useEffect, useState } from "react";
import { customFetch, customPost } from "../../Auth/customFetch";
import { saveSuspendedBilling } from '../../../lib/Multi/suspendedBilling';
import { useRouter } from 'next/navigation';
import { RiArrowGoBackFill, RiCheckLine, RiCloseCircleFill, RiPauseCircleLine, RiResetLeftFill } from '@remixicon/react';
import { toast } from 'react-toastify';

import type {MultiBillingData} from '../../../lib/Multi/MultiTypes';
interface MultiBillingHeaderProps {
    billingdata: MultiBillingData;
    setBillingData: React.Dispatch<React.SetStateAction<MultiBillingData>>;
    useServices: boolean;
    specialCodeError: string;
    loadingSpecialCode: boolean;
    loadingBackendBilling: boolean;
    canLoadData: boolean;
    onPackageActivation: (checked: boolean) => void;
    onUseServicesChange: (checked: boolean) => void;
    onSpecialCodeChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onLoadBackendBilling: () => void;
    onReset: () => void;
    onReturnToMulti: () => void;
    isSaleSaved?: boolean;
    autoStarted?: boolean;
}
// Promo interface and validatePromoCode function
interface Promo {
    id: number;
    code: string;
    description: string;
    campaign_id: number | null;
    discount_type: string;
    discount_value: string;
    max_uses: number;
    times_used: number;
    is_active: number;
    valid_from: string | null;
    valid_to: string | null;
    created_at: string | null;
    updated_at: string | null;
}
async function validatePromoCode(code: string, patientid: number): Promise<{ valid: boolean; message?: string; promo?: Promo }> {
    try {
        const res: { valid: boolean, reason?: string, promo?: Promo } = await customPost('promo-codes/validate', 'POST', { code, patientid });
        if (res.valid && res.promo) {
            return { valid: true, message: "Promo code applied successfully!", promo: res.promo };
        } else {
            return { valid: false, message: res.reason || "Invalid promo code" };
        }
    } catch (err) {
        return { valid: false, message: "Error validating promo code" };
    }
}

export default function MultiBillingHeader({
    billingdata,
    setBillingData,
    useServices,
    specialCodeError,
    loadingSpecialCode,
    loadingBackendBilling,
    canLoadData,
    onPackageActivation,
    onUseServicesChange,
    onSpecialCodeChange,
    onLoadBackendBilling,
    onReset,
    onReturnToMulti,
    isSaleSaved = false,
    autoStarted = false,
}: MultiBillingHeaderProps) {
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendNote, setSuspendNote] = useState('');
    const [suspending, setSuspending] = useState(false);
    const router = useRouter();
    useEffect(() => {
        setSuspendNote(billingdata.suspendNote || '');
    }, [billingdata.suspendNote]);

    const handleSuspend = async (convertToSale = false) => {
        if (suspending || isSaleSaved) return;
        setSuspending(true);
        try {
            const draftId = await saveSuspendedBilling(billingdata, suspendNote);
            toast.success('Transaction suspended.');
            setShowSuspendModal(false);
            setSuspendNote('');
            if (convertToSale) {
                router.push(`/billing/patientid?resumeDraftId=${draftId}&resumeBillingSource=${billingdata.billingSource}`);
            } else {
                router.push('/billing/suspended-transactions');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to suspend this transaction.');
        } finally {
            setSuspending(false);
        }
    };

    // Function to verify promo code
    const handleVerifyPromo = async () => {
        setBillingData(prev => ({ ...prev, promoVerifyLoading: true, promoVerifyMessage: null, promoVerifySuccess: null }));
        const code = billingdata.promoCode || '';
        const patientid = billingdata.patientid || 0;
        const result = await validatePromoCode(String(code), patientid);
        setBillingData(prev => ({
            ...prev,
            promoVerifyLoading: false,
            promoVerifyMessage: result.message || '',
            promoVerifySuccess: result.valid
        }));
    };


    const handleVerifyBillingId = async () => {
        if (!billingdata.billingid || isNaN(Number(billingdata.billingid))) {
            toast.error('Please enter a valid Billing ID to verify.');
            setBillingData(prev => ({ ...prev, billingIdVerified: false }));
            return;
        }
        const arr = await getTransactionPreviousBillingRecords(Number(billingdata.billingid));
        if (Array.isArray(arr) && arr.length > 0) {
            setBillingData(prev => ({ ...prev, previousRecordsSummary: arr[0], billingIdVerified: true }));
            toast.success('Billing ID ' + billingdata.billingid + ' verified!');
        } else {
            toast.error('No previous billing record found for this Billing ID.');
            setBillingData(prev => ({ ...prev, billingIdVerified: false }));
        }
    };


    const getTransactionPreviousBillingRecords = async (billingid: number) => {
        try {
            const response = await customFetch(`billing/previous/transaction/data?billingid=${billingid}`);
            return response.result;
        } catch (err) {
            return [];
        }
    };

    // Function to reset promo verification state
    const resetPromoVerification = () => {
        setBillingData(prev => ({ ...prev, promoVerifySuccess: null, promoVerifyMessage: null }));
    };

    return (
        <>
            <Card.Header className="bg-white py-2 px-2 " >
                <div className="d-flex flex-wrap align-items-center gap-2 w-100">
                    <Form.Check
                        type="checkbox"
                        label="Use Package"
                        checked={billingdata.isPackageUsed}
                        onChange={e => onPackageActivation(e.target.checked)}
                        className="mb-0 me-1 flex-shrink-0"
                        aria-label="Use Package"
                    />
                    <span className="mx-1" style={{ color: '#bbb' }}>|</span>
                    <Form.Check
                        type="checkbox"
                        label="Use Services"
                        checked={useServices}
                        onChange={e => onUseServicesChange(e.target.checked)}
                        className="mb-0 me-1 flex-shrink-0"
                        aria-label="Use Services"
                    />
                    <span className="mx-1" style={{ color: '#bbb' }}>|</span>
                    <Form.Check
                        type="checkbox"
                        label="Reference Code"
                        disabled={billingdata.billingSource == 1}
                        checked={!!billingdata.useSpecialCode}
                        onChange={e => setBillingData({ ...billingdata, useSpecialCode: e.target.checked })}
                        className="mb-0 flex-shrink-0"
                        aria-label="Reference Code"
                    />
                    <span className="mx-1" style={{ color: '#bbb' }}>|</span>
                    <Form.Check
                        type="checkbox"
                        label="Promo Code"
                        checked={!!billingdata.showPromoCode}
                        onChange={e => {
                            setBillingData(prev => ({ ...prev, showPromoCode: e.target.checked, isPromo: e.target.checked }));
                            if (!e.target.checked) resetPromoVerification();
                        }}
                        className="mb-0 flex-shrink-0"
                        aria-label="Show Promo Code"
                    />
                     <Form.Check
                        type="checkbox"
                        label="Use Different billing date"
                        checked={!!billingdata.isBilledAgaintsDate}
                        onChange={e => {
                            setBillingData(prev => ({ ...prev, isBilledAgaintsDate: e.target.checked}));
                        }}
                        className="mb-0 flex-shrink-0"
                        aria-label="Show Promo Code"
                    />
                    {
                        billingdata.isBilledAgaintsDate && <input type="date" 
                          onChange={(ev) =>  {
                              setBillingData(prev => ({ ...prev, billedagaints : ev.target.value}));
                          }  }
                        value={billingdata.billedagaints instanceof Date ? billingdata.billedagaints.toISOString().slice(0, 10) : billingdata.billedagaints || ''} />
                    }
                    {/* Promo Code Verified Badge */}
                    {billingdata.showPromoCode && billingdata.promoVerifySuccess === true && (
                        <span className="badge bg-success ms-2 text-sm" style={{ fontSize: '0.55em', fontWeight: 500 }}>Promo Verified</span>
                    )}
                    {billingdata.showPromoCode && billingdata.promoVerifySuccess === false && (
                        <span className="badge bg-danger ms-2" style={{ fontSize: '0.55em', fontWeight: 500 }}>Promo Invalid</span>
                    )}
                    {!!billingdata?.resultDeliveryMode && (
                        <span className="badge bg-primary ms-2 text-sm text-capitalize" style={{ fontSize: '0.55em', fontWeight: 500 }}>
                            Results: {billingdata.resultDeliveryMode}
                        </span>
                    )}
                    <span className="mx-1" style={{ color: '#bbb' }}>|</span>
                    <Form.Check
                        type="checkbox"
                        label="Create Related Billing"
                        checked={!!billingdata.showRelatedBilling}
                        onChange={e => setBillingData(prev => ({ ...prev, showRelatedBilling: e.target.checked }))}
                        className="mb-0 me-2 flex-shrink-0"
                        aria-label="Create Related Billing"
                    />
                    {/* Billing ID Verified Badge */}
                    {billingdata.showRelatedBilling && billingdata.billingid && billingdata.billingIdVerified && (
                        <span className="badge bg-success ms-2 text-sm" style={{ fontSize: '0.6em' }}>Billing ID Verified</span>
                    )}
                    {/* Entity Info moved here */}
                    {!!billingdata.entityId && !!billingdata.entitytype && (
                        <span className="ms-2 px-2 py-1 bg-light border rounded small text-nowrap flex-shrink-1 d-flex align-items-center gap-2"
                            style={{ maxWidth: '40vw', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}
                        >
                            <span>ID: <b>{billingdata.entityId}</b></span>
                            <span className="mx-2">|</span>
                            <span>Name: <b style={{
                                maxWidth: 120,
                                display: 'inline-block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                verticalAlign: 'bottom',
                            }} title={billingdata.entityname || undefined}>{billingdata.referalName}</b></span>
                            <span className="mx-2">|</span>
                            <span>Type: <b className="text-capitalize">{(() => {
                                const billingSourceMap: Record<number, string> = {
                                    1: 'General',
                                    2: 'Organization',
                                    4: 'Insurance',
                                    6: 'Clinician',
                                };
                                return billingSourceMap[Number(billingdata.billingSource)] || billingdata.entitytype;
                            })()}</b></span>
                        </span>
                    )}

                    

                    <Button
                        variant="outline-warning"
                        size="sm"
                        title="Suspend transaction"
                        onClick={() => {
                            setSuspendNote(billingdata.suspendNote || '');
                            setShowSuspendModal(true);
                        }}
                        disabled={suspending || isSaleSaved || Boolean(billingdata.isAdjustment)}
                    >
                        <RiPauseCircleLine size={20} /> {billingdata.ispricingcheckout ? 'Suspend Quote' : 'Suspend Sale'}
                    </Button>
                    {billingdata.ispricingcheckout && (
                        <Button variant="outline-success" size="sm" disabled={suspending || isSaleSaved} onClick={() => void handleSuspend(true)}>
                            Convert to Sale
                        </Button>
                    )}
                    <Button variant="outline-danger" size="sm" title='reset transaction' onClick={onReset}>
                        <RiResetLeftFill size={20} />
                    </Button>
                    <Button variant="outline-primary" size="sm" title="back to multi transaction selection" onClick={onReturnToMulti}>
                        <RiArrowGoBackFill size={20} /> Back to Selection
                    </Button>
                </div>
            </Card.Header>

            <Modal show={showSuspendModal} onHide={() => !suspending && setShowSuspendModal(false)} centered>
                <Modal.Header closeButton={!suspending}>
                    <Modal.Title>{billingdata.ispricingcheckout ? 'Suspend Quote' : 'Suspend Sale'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-2">Save this unfinished transaction so it can be resumed later.</p>
                    <Form.Label htmlFor="suspend-sale-note">Note (optional)</Form.Label>
                    <Form.Control
                        id="suspend-sale-note"
                        as="textarea"
                        rows={3}
                        value={suspendNote}
                        onChange={event => setSuspendNote(event.target.value)}
                        placeholder="Add a note for the next person who resumes this sale"
                        disabled={suspending}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSuspendModal(false)} disabled={suspending}>
                        Keep Editing
                    </Button>
                    <Button variant="warning" onClick={() => void handleSuspend()} disabled={suspending}>
                        {suspending && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                        {billingdata.ispricingcheckout ? 'Suspend Quote' : 'Suspend Sale'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Card.Header className="py-3" >
                <div className="container-fluid px-0">
                    <div className="row m-0">
                        <div className="col-12 col-lg-auto d-flex flex-row flex-wrap gap-2 mt-2 mt-lg-0" >
                            <Button
                                variant="primary"
                                size="sm"
                                className="me-2"
                                onClick={onLoadBackendBilling}
                                disabled={loadingBackendBilling || !canLoadData}
                                aria-label="Load Billing Data"
                                style={{ height: 38, marginLeft: '-20px !important' }}
                            >
                                {loadingBackendBilling ? <Spinner as="span" animation="border" size="sm" className="me-1" /> : null}
                                {autoStarted ? 'Reload tests and prices' : 'Start Transaction'}
                            </Button>
                         
                        </div>
                        {/* Special Code Input */}
                        {!!billingdata.useSpecialCode && (
                            <div className="col-12 col-lg-auto d-flex align-items-center" >
                                <Form.Control
                                    type="text"
                                    placeholder="Enter special code"
                                    value={billingdata.specialCode || ''}
                                    onChange={onSpecialCodeChange}
                                    isInvalid={!!specialCodeError}
                                    size="sm"
                                    style={{ minWidth: 0, height: 38 }}
                                    className="me-2 flex-grow-1 border"
                                    aria-label="Special Code"
                                />
                                {loadingSpecialCode && (
                                    <span className="ms-2 text-primary small">Loading...</span>
                                )}
                            </div>
                        )}
                        {/* Billing ID Input (conditionally shown) */}
                        {billingdata.showRelatedBilling && (
                            <div className="col-12 col-lg-auto d-flex align-items-center" style={{ minWidth: 160, height: 40 }}>
                                <Form.Control
                                    type="number"
                                    placeholder="Check Billing ID"
                                    size="sm"
                                    style={{ minWidth: 0, height: 38 }}
                                    className="w-100 border"
                                    value={billingdata.billingid || ''}
                                    onChange={e => setBillingData(prev => ({ ...prev, billingid: e.target.value }))}
                                    aria-label="Billing ID"
                                />
                                <Button
                                    variant="outline-info"
                                    size="sm"
                                    className="ms-2"
                                    style={{ height: 38, display: 'flex', alignItems: 'center' }}
                                    onClick={handleVerifyBillingId}
                                    aria-label="Verify Billing ID"
                                >
                                    Verify
                                </Button>
                            </div>
                        )}
                        {/* Promo Code Section */}
                        {billingdata.showPromoCode && (
                            <div className="col-12 col-lg-auto d-flex align-items-center" style={{ minWidth: 220, height: 40 }}>
                                <Form className="d-flex flex-row align-items-center w-100" style={{ minWidth: 0 }}>
                                    <Form.Control
                                        id="promoCode"
                                        type="text"
                                        value={billingdata.promoCode || ''}
                                        onChange={e => setBillingData(prev => ({ ...prev, promoCode: e.target.value, promoVerifySuccess: null, promoVerifyMessage: null }))}
                                        placeholder="Enter promo code"
                                        size="sm"
                                        style={{ minWidth: 0, height: 38 }}
                                        className="flex-grow-1 border"
                                        aria-label="Promo Code"
                                    />
                                    <div className="btn-group ms-2 flex-shrink-0" role="group" style={{ height: 38 }}>
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={handleVerifyPromo}
                                            disabled={billingdata.promoVerifyLoading || !(billingdata.promoCode && String(billingdata.promoCode).length > 0)}
                                            aria-label="Verify Promo Code"
                                            style={{ height: 38, display: 'flex', alignItems: 'center' }}
                                        >
                                            {billingdata.promoVerifyLoading ? (
                                                <Spinner as="span" animation="border" size="sm" className="me-1" />
                                            ) : (
                                                "Verify"
                                            )}
                                        </Button>
                                        <Button
                                            variant={billingdata.promoVerifySuccess === true ? "success" : billingdata.promoVerifySuccess === false ? "danger" : "outline-secondary"}
                                            size="sm"
                                            disabled
                                            style={{ width: 40, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            aria-label="Promo Code Status"
                                        >
                                            {billingdata.promoVerifySuccess === true ? (
                                                <RiCheckLine size={20} color="#fff" />
                                            ) : billingdata.promoVerifySuccess === false ? (
                                                <RiCloseCircleFill size={20} color="#fff" />
                                            ) : null}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )}
                        {/* Action Buttons */}

                    </div>
                </div>
            </Card.Header>
        </>
    );
}
