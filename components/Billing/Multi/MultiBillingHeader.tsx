import { Card, Form, Button, Spinner } from "react-bootstrap";
import { useState } from "react";
import { customPost } from "../../Auth/customFetch";
import { RiArrowGoBackFill, RiCheckLine, RiCloseCircleFill } from '@remixicon/react';

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
    // Promo code verification state
    const [promoVerifyLoading, setPromoVerifyLoading] = useState(false);
    const [promoVerifyMessage, setPromoVerifyMessage] = useState<string | null>(null);
    const [promoVerifySuccess, setPromoVerifySuccess] = useState<boolean | null>(null);

    const handleVerifyPromo = async () => {
        setPromoVerifyLoading(true);
        setPromoVerifyMessage(null);
        setPromoVerifySuccess(null);
        const code = billingdata.promoCode || '';
        const patientid = billingdata.patientid || 0;
        const result = await validatePromoCode(code, patientid);
        setPromoVerifyLoading(false);
        setPromoVerifyMessage(result.message || '');
        setPromoVerifySuccess(result.valid);
        // Optionally, update billingdata with promo info if needed
        // if (result.valid && result.promo) setBillingData(prev => ({ ...prev, promo: result.promo }));
    };

    return (
        <>
            {/* NEW: Dedicated Card Header for Package/Service/Reference Code */}
            <Card.Header className="bg-white bg-opacity-75 py-2 px-2 border-bottom" style={{ borderTop: '1px solid #dee2e6' }}>
                <div className="d-flex flex-wrap align-items-center gap-2 w-100">
                    <Form.Check
                        type="checkbox"
                        label="Use Package"
                        checked={billingdata.isPackageUsed}
                        onChange={e => onPackageActivation(e.target.checked)}
                        className="mb-0 me-1 flex-shrink-0"
                        aria-label="Use Package"
                    />
                    <span className="mx-1" style={{color:'#bbb'}}>|</span>
                    <Form.Check
                        type="checkbox"
                        label="Use Services"
                        checked={useServices}
                        onChange={e => onUseServicesChange(e.target.checked)}
                        className="mb-0 me-1 flex-shrink-0"
                        aria-label="Use Services"
                    />
                    <span className="mx-1" style={{color:'#bbb'}}>|</span>
                    <Form.Check
                        type="checkbox"
                        label="Reference Code"
                        checked={useSpecialCode}
                        onChange={e => onUseSpecialCodeChange(e.target.checked)
                        }
                        className="mb-0 flex-shrink-0"
                        aria-label="Reference Code"
                    />
                    <span className="mx-1" style={{color:'#bbb'}}>|</span>
                    <Form.Check
                        type="checkbox"
                        label="Promo Code"
                        checked={billingdata.showPromoCode}
                        onChange={e => setBillingData(prev => ({ ...prev, showPromoCode: e.target.checked ,isPromo: e.target.checked}))}
                        className="mb-0 flex-shrink-0"
                        aria-label="Show Promo Code"
                    />
                    {/* Entity Info moved here */}
                    {!!billingdata.entityId && !!billingdata.entitytype && (
                        <span className="ms-2 px-2 py-1 bg-light border rounded small text-nowrap flex-shrink-1 d-flex align-items-center gap-2"
                            style={{maxWidth: '40vw', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500}}
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

            {/* Main Card Header (rest of your controls remain here) */}
            <Card.Header className="bg-light bg-opacity-75 py-3 px-2 border-bottom" style={{ borderTop: '1px solid #dee2e6' }}>
                <div className="container-fluid px-0">
                    <div className="row gx-2 gy-2 align-items-center w-100 flex-lg-nowrap flex-wrap">
                        {/* Special Code Input */}
                        {useSpecialCode && (
                            <div className="col-12 col-lg-auto d-flex align-items-center" style={{minWidth: 180, height: 40}}>
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
                        {/* Billing ID Input */}
                        <div className="col-12 col-lg-auto d-flex align-items-center" style={{minWidth: 160, height: 40}}>
                            <Form.Control
                                type="number"
                                placeholder="Check Billing ID"
                                size="sm"
                                style={{ minWidth: 0, height: 38 }}
                                className="w-100 border"
                                value={billingdata.billingid || ''}
                                onChange={e => setBillingData(prev => ({ ...prev, billingid: e.target.value }))}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && e.currentTarget.value) {
                                        const url = new URL(window.location.href);
                                        url.searchParams.set('billingid', e.currentTarget.value);
                                        url.searchParams.set('isNewTransaction', '0');
                                        window.location.search = url.search;
                                    }
                                }}
                                aria-label="Billing ID"
                            />
                        </div>
                        {/* Promo Code Section */}
                        {billingdata.showPromoCode && (
                            <div className="col-12 col-lg-auto d-flex align-items-center" style={{minWidth: 220, height: 40}}>
                                <Form className="d-flex flex-row align-items-center w-100" style={{ minWidth: 0 }}>
                                    <Form.Control
                                        id="promoCode"
                                        type="text"
                                        value={billingdata.promoCode || ''}
                                        onChange={e => setBillingData(prev => ({ ...prev, promoCode: e.target.value }))}
                                        placeholder="Enter promo code"
                                        size="sm"
                                        style={{ minWidth: 0, height: 38 }}
                                        className="flex-grow-1 border"
                                        aria-label="Promo Code"
                                    />
                                    <div className="btn-group ms-2 flex-shrink-0" role="group" style={{height: 38}}>
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            onClick={handleVerifyPromo}
                                            disabled={promoVerifyLoading || !(billingdata.promoCode && billingdata.promoCode.length > 0)}
                                            aria-label="Verify Promo Code"
                                            style={{height: 38, display: 'flex', alignItems: 'center'}}
                                        >
                                            {promoVerifyLoading ? (
                                                <Spinner as="span" animation="border" size="sm" className="me-1" />
                                            ) : (
                                                "Verify"
                                            )}
                                        </Button>
                                        <Button
                                            variant={promoVerifySuccess === true ? "success" : promoVerifySuccess === false ? "danger" : "outline-secondary"}
                                            size="sm"
                                            disabled
                                            style={{ width: 40, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            aria-label="Promo Code Status"
                                        >
                                            {promoVerifySuccess === true ? (
                                                <RiCheckLine size={20} color="#fff" />
                                            ) : promoVerifySuccess === false ? (
                                                <RiCloseCircleFill size={20} color="#fff" />
                                            ) : null}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )}
                        {/* Action Buttons */}
                        <div className="col-12 col-lg-auto d-flex flex-row flex-wrap align-items-center gap-2 justify-content-lg-end mt-2 mt-lg-0" style={{minWidth: 320, height: 40}}>
                            <Button
                                variant="primary"
                                size="sm"
                                className="me-2"
                                onClick={onLoadBackendBilling}
                                disabled={loadingBackendBilling || !canLoadData}
                                aria-label="Load Billing Data"
                                style={{height: 38, display: 'flex', alignItems: 'center'}}
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
                                style={{height: 38, display: 'flex', alignItems: 'center'}}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="ms-2"
                                onClick={onReturnToMulti}
                                aria-label="Return to Multi"
                                style={{height: 38, display: 'flex', alignItems: 'center'}}
                            >
                                <RiArrowGoBackFill/> Multi
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
