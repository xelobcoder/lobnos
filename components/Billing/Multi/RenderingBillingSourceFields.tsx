'use client';
import { Form, Modal, Button } from "react-bootstrap";
import { useState, useContext } from "react";
import ClinicianFiltering from "../../accessories/SectorFileringComponents/ClinicianFiltering";
import InsuranceOrganizationFiltering from "../../accessories/SectorFileringComponents/InsuranceOrganizationFiltering";
import OrganizationalBillingSourceSearch from "../BillingContextComponents/BillingSourceComponents/OrganizationBillingSearch";
import { MultiBillingContext } from "./MultiBillingContext";
import { urgencyOptions } from '../../../lib/billingLib';
import QuickAddReferralEntity from "./QuickAddReferralEntity";
import ClinicianReferralOrganizations from "./ClinicianReferralOrganizations";

export default function MultiRenderingBillingSourceFields({
    updateValuesToContext,
    handleSelectedEntityClinician,
    handleSelectedEntityInsurance,
    handleUrgencyChange,
    isClient,
}) {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata, setBillingData } = context;
    const [showTypeAlert, setShowTypeAlert] = useState(false);
    const [expectedType, setExpectedType] = useState("");
    const [returnedType, setReturnedType] = useState("");


    const handleNormalRefererWithoutUpdatingBilling = (data: any, target: "Clinician" | "organization") => {
        const expected = target === "Clinician" ? "clinician" : "organization";
        const returned = data.entitytype?.toLowerCase() || "unknown";
        const { id, name } = data;

        setBillingData((prev: any) => ({
            ...prev,
            organizationId: target === "organization" ? id : prev.organizationId,
            organizationname: target === "organization" ? name : prev.organizationname,
            clinicianId: target === "Clinician" ? id : prev.clinicianId,
            clinicianname: target === "Clinician" ? name : prev.clinicianname,
        }))
    }

    const selectedReferralOrganization = billingdata.organizationId
        ? { id: Number(billingdata.organizationId), name: billingdata.organizationname || "the selected organization" }
        : null;

    const clinicianReferralOrganizations = billingdata.clinicianId ? (
        <ClinicianReferralOrganizations
            clinicianId={Number(billingdata.clinicianId)}
            clinicianName={billingdata.clinicianname || "This clinician"}
            selectedOrganization={selectedReferralOrganization}
            onSelectOrganization={value => handleNormalRefererWithoutUpdatingBilling(value, "organization")}
        />
    ) : null;

    return (
        <div style={{ fontSize: '0.95em', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
            <Modal show={showTypeAlert} onHide={() => setShowTypeAlert(false)} centered>
                <Modal.Header closeButton className="bg-danger text-white py-2 px-3 border-bottom-0">
                    <Modal.Title className="fs-6 fw-bold">
                        <span className="d-flex align-items-center">
                            <span className="me-2" style={{ fontSize: '1.2rem' }}>⚠️</span>
                            Entity Type Mismatch
                        </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light text-danger" style={{ fontWeight: 500 }}>
                    The entity type of the returned data does not match the current category.<br />
                    {expectedType && returnedType && (
                        <div className="row mt-2 g-0 border rounded overflow-hidden">
                            <div className="col-6 border-end d-flex flex-column align-items-center py-2">
                                <span className="text-dark small">Expected</span>
                                <span className="badge bg-primary mt-1">{expectedType}</span>
                            </div>
                            <div className="col-6 d-flex flex-column align-items-center py-2">
                                <span className="text-dark small">Returned</span>
                                <span className="badge bg-warning text-dark mt-1">{returnedType}</span>
                            </div>
                        </div>
                    )}
                    <span className="text-secondary d-block mt-2">Please check your special code or category selection.</span>
                </Modal.Body>
                <Modal.Footer className="bg-light border-0 py-2">
                    <Button variant="danger" size="sm" onClick={() => setShowTypeAlert(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            {typeof billingdata.billingSource == "number" && billingdata.billingSource > 1 && (
                <div className="p-2  mb-2">
                    {billingdata.billingSource === 2 && (
                        <OrganizationalBillingSourceSearch updatefunction={updateValuesToContext} />
                    )}
                    {billingdata.billingSource === 3 && (
                        <Form.Group>
                            <Form.Label className="small text-muted">Search Organization</Form.Label>
                            {isClient && (
                                <div className="position-relative">
                                    <InsuranceOrganizationFiltering

                                        onSelect={handleSelectedEntityInsurance} />
                                </div>
                            )}
                        </Form.Group>
                    )}
                    {billingdata.billingSource === 4 && (
                        <div>
                            <Form.Group>
                                <Form.Label className="small fw-bold">NHIS MEMBERSHIP CODE</Form.Label>
                                <Form.Control
                                    type="text" inputMode="numeric" maxLength={64}
                                    placeholder="Enter NHIS ID"
                                    className="form-control"
                                    value={billingdata.nhismembershipid || ''}
                                    required
                                    onChange={(ev) => {
                                        setBillingData({ ...billingdata, nhismembershipid: ev.target.value.replace(/\D/g,'') })
                                    }}
                                    size="sm"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="small fw-bold">CLAIM CHECK CODE</Form.Label>
                                <Form.Control
                                    type="text" inputMode="numeric" maxLength={64}
                                    placeholder="Enter CCC"
                                    className="form-control "
                                    value={billingdata.claimscheckcode || ''}
                                    required
                                    onChange={(ev) => {
                                        setBillingData({ ...billingdata, claimscheckcode: ev.target.value.replace(/\D/g,'') })
                                    }}
                                    size="sm"
                                />
                            </Form.Group>
                            <hr style={{ borderBottom: "2px dotted lightgray" }} />
                            {
                                billingdata.claimscheckcode && billingdata.nhismembershipid && billingdata.cart && (
                                    <div>

                                        {
                                            billingdata.organizationId ?
                                                (
                                                    <div className="mt-2 bg-secondary-subtle p-2 rounded d-flex justify-content-between">
                                                        Organization: <span className="fw-bold">{billingdata.organizationname}</span>
                                                        <button className="btn btn-danger btn-sm">reset</button>
                                                    </div>
                                                ) :
                                                (
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="small text-muted">Select Organization</Form.Label>
                                                        {isClient && (
                                                            <div className="position-relative">
                                                                <OrganizationalBillingSourceSearch updatefunction={(value) => {
                                                                    handleNormalRefererWithoutUpdatingBilling(value, "organization");
                                                                }} />
                                                            </div>
                                                        )}
                                                        <QuickAddReferralEntity kind="organization" onCreated={value => handleNormalRefererWithoutUpdatingBilling(value, "organization")} />
                                                    </Form.Group>
                                                )
                                        }
                                        {
                                            billingdata.clinicianId ? (
                                                <>
                                                    <div className="mt-2 bg-secondary-subtle p-2 rounded d-flex justify-content-between">
                                                        Clinician: <span className="fw-bold">{billingdata.clinicianname}</span>
                                                        <button className="btn btn-danger btn-sm">reset</button>
                                                    </div>
                                                    {clinicianReferralOrganizations}
                                                </>
                                            ) :
                                                (
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="small text-muted">Select Clinician</Form.Label>
                                                        <div className="position-relative">
                                                            <ClinicianFiltering isAutoLoadAll={true} isBulk={true} onSelect={(value) => {
                                                                handleNormalRefererWithoutUpdatingBilling(value, "Clinician");
                                                            }} />
                                                        </div>
                                                        <QuickAddReferralEntity kind="clinician" organization={selectedReferralOrganization} onCreated={value => handleNormalRefererWithoutUpdatingBilling(value, "Clinician")} />
                                                    </Form.Group>
                                                )
                                        }
                                    </div>
                                )
                            }

                        </div>
                    )}
                </div>
            )}
            {billingdata.billingSource === 6 && (
                <Form.Group>
                    <Form.Label className="small text-muted">Search Clinician</Form.Label>
                    <div className="position-relative">
                        <ClinicianFiltering isAutoLoadAll={true} isBulk={true} onSelect={handleSelectedEntityClinician} />
                    </div>
                </Form.Group>
            )}
            {billingdata.billingSource === 1 && (
                <>
                    <p className="small text-muted">General / Cash prices apply. Organization and clinician referrals are optional and do not change the price list.</p>
                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">Referral organization (optional)</Form.Label>
                        {billingdata.organizationId ? (
                            <div className="d-flex align-items-center justify-content-between gap-2">
                                <span>{billingdata.organizationname}</span>
                                <Button size="sm" variant="outline-secondary" onClick={() => setBillingData(prev => ({
                                    ...prev, organizationId: null, organizationname: null,
                                }))}>Remove organization</Button>
                            </div>
                        ) : (
                            <>
                                <OrganizationalBillingSourceSearch updatefunction={value => handleNormalRefererWithoutUpdatingBilling(value, "organization")} />
                                <QuickAddReferralEntity kind="organization" onCreated={value => handleNormalRefererWithoutUpdatingBilling(value, "organization")} />
                            </>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">Referring clinician (optional)</Form.Label>
                        {billingdata.clinicianId ? (
                            <>
                                <div className="d-flex align-items-center justify-content-between gap-2">
                                    <span>{billingdata.clinicianname}</span>
                                    <Button size="sm" variant="outline-secondary" onClick={() => setBillingData(prev => ({
                                        ...prev, clinicianId: null, clinicianname: null,
                                    }))}>Remove clinician</Button>
                                </div>
                                {clinicianReferralOrganizations}
                            </>
                        ) : (
                            <>
                                <ClinicianFiltering isBulk={true} onSelect={value => handleNormalRefererWithoutUpdatingBilling(value, "Clinician")} />
                                <QuickAddReferralEntity kind="clinician" organization={selectedReferralOrganization} onCreated={value => handleNormalRefererWithoutUpdatingBilling(value, "Clinician")} />
                            </>
                        )}
                    </Form.Group>
                </>
            )}
            {typeof billingdata.billingSource === 'number' && billingdata.billingSource > 0 && (
                <div>
                    <Form.Label className="mx-1 text-sm fw-bold">Select Urgency</Form.Label>
                    <Form.Select
                        value={billingdata.status}
                        className="mx-1"
                        onChange={(e) => handleUrgencyChange({ label: e.target.value, value: e.target.value })}
                        size="sm"
                    >
                        {urgencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Form.Select>
                </div>
            )}
        </div>
    );
}