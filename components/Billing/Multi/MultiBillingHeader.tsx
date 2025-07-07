import { Card, Form, Button, Spinner } from "react-bootstrap";
import { useEffect } from "react";
import { customFetch, customPost } from "../../Auth/customFetch";
import { RiArrowGoBackFill, RiCheckLine, RiCloseCircleFill } from '@remixicon/react';
import { toast } from 'react-toastify';

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
    useSpecialCode,
    specialCode,
    specialCodeError,
    loadingSpecialCode,
    loadingBackendBilling,
    canLoadData,
    onPackageActivation,
    onUseServicesChange,
    onUseSpecialCodeChange,
    onSpecialCodeChange,
    onLoadBackendBilling,
    onReset,
    onReturnToMulti,
    onCheckout
}) {
    // Function to verify promo code
    const handleVerifyPromo = async () => {
        setBillingData(prev => ({ ...prev, promoVerifyLoading: true, promoVerifyMessage: null, promoVerifySuccess: null }));
        const code = billingdata.promoCode || '';
        const patientid = billingdata.patientid || 0;
        const result = await validatePromoCode(code, patientid);
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
                        checked={useSpecialCode}
                        onChange={e => onUseSpecialCodeChange(e.target.checked)
                        }
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
                    {/* Promo Code Verified Badge */}
                    {billingdata.showPromoCode && billingdata.promoVerifySuccess === true && (
                        <span className="badge bg-success ms-2 text-sm" style={{ fontSize: '0.55em', fontWeight: 500 }}>Promo Verified</span>
                    )}
                    {billingdata.showPromoCode && billingdata.promoVerifySuccess === false && (
                        <span className="badge bg-danger ms-2" style={{ fontSize: '0.55em', fontWeight: 500 }}>Promo Invalid</span>
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
                            }} title={billingdata.entityname}>{billingdata.entityname}</b></span>
                            <span className="mx-2">|</span>
                            <span>Type: <b className="text-capitalize">{(() => {
                                const billingSourceMap = {
                                    1: 'General',
                                    2: 'Organization',
                                    4: 'Insurance',
                                    6: 'Clinician',
                                };
                                return billingSourceMap[Number(billingdata.billingSource)] || billingdata.entitytype;
                            })()}</b></span>
                        </span>
                    )}
                </div>
            </Card.Header>
     
            <Card.Header className="py-3  px-2 " >
                <div className="container-fluid px-0">
                    <div className="row m-0">
                        {/* Special Code Input */}
                        {useSpecialCode && (
                            <div className="col-12 col-lg-auto d-flex align-items-center" >
                                <Form.Control
                                    type="text"
                                    placeholder="Enter special code"
                                    value={specialCode}
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
                                            disabled={billingdata.promoVerifyLoading || !(billingdata.promoCode && billingdata.promoCode.length > 0)}
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
                        <div className="col-12 col-lg-auto d-flex flex-row flex-wrap align-items-center gap-2 justify-content-lg-end mt-2 mt-lg-0" style={{ minWidth: 320, height: 40 }}>
                            <Button
                                variant="primary"
                                size="sm"
                                className="me-2"
                                onClick={onLoadBackendBilling}
                                disabled={loadingBackendBilling || !canLoadData}
                                aria-label="Load Billing Data"
                                style={{ height: 38, display: 'flex', alignItems: 'center' }}
                            >
                                {loadingBackendBilling ? <Spinner as="span" animation="border" size="sm" className="me-1" /> : null}
                                Load
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="ms-1"
                                onClick={onReset}
                                aria-label="Reset Billing Form"
                                style={{ height: 38, display: 'flex', alignItems: 'center' }}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="ms-2"
                                onClick={onReturnToMulti}
                                aria-label="Return to Multi"
                                style={{ height: 38, display: 'flex', alignItems: 'center' }}
                            >
                                <RiArrowGoBackFill /> Multi
                            </Button>
                            <Button
                                variant="success"
                                size="sm"
                                className="ms-2"
                                style={{ minWidth: 100, height: 38, display: 'flex', alignItems: 'center' }}
                                disabled={
                                    !(Array.isArray(billingdata.cart) && billingdata.cart.length > 0) &&
                                    !(Array.isArray(billingdata.servicesProvided) && billingdata.servicesProvided.length > 0)
                                }
                                onClick={onCheckout}
                                aria-label="Checkout"
                            >
                                Checkout
                            </Button>
                        </div>
                    </div>
                </div>
            </Card.Header>
        </>
    );
}
