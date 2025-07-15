'use client';
import { Form, Modal, Button } from "react-bootstrap";
import { useState, useContext } from "react";
import ClinicianFiltering from "../../accessories/SectorFileringComponents/ClinicianFiltering";
import InsuranceOrganizationFiltering from "../../accessories/SectorFileringComponents/InsuranceOrganizationFiltering";
import OrganizationalBillingSourceSearch from "../BillingContextComponents/BillingSourceComponents/OrganizationBillingSearch";
import Select from 'react-select';
import { MultiBillingContext } from "./MultiBillingContext";
import { urgencyOptions } from '../../../lib/billingLib';
import { reactSelectCustomStyles } from "../../Auth/customFetch";

export default function MultiRenderingBillingSourceFields({
    updateValuesToContext,
    handleSelectedEntityClinician,
    handleSelectedEntityInsurance,
    handleUrgencyChange,
    isClient,
}) {
    const context = useContext(MultiBillingContext);
    if (!context) throw new Error("MultiBillingContext not found");
    const { billingdata } = context;

    const [showTypeAlert, setShowTypeAlert] = useState(false);
    const [expectedType, setExpectedType] = useState("");
    const [returnedType, setReturnedType] = useState("");


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
                        <OrganizationalBillingSourceSearch updatefunction={updateValuesToContext}
                             />
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
                        <Form.Group>
                            <Form.Label className="small text-muted">Claim Code</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter claim code"
                                className="rounded-3 border-light"
                                size="sm"
                            />
                        </Form.Group>
                    )}
                    {billingdata.billingSource === 6 && (
                        <Form.Group>
                            <Form.Label className="small text-muted">Search Clinician</Form.Label>
                            <div className="position-relative">
                                <ClinicianFiltering isBulk={true} onSelect={handleSelectedEntityClinician} />
                            </div>
                        </Form.Group>
                    )}
                </div>
            )}
            {billingdata.billingSource === 1 && (
                <>
                    <div>
                        <label className="pls-label">Referral Type</label>
                        <div>
                            <Select
                                className="react-select-container"
                                styles={reactSelectCustomStyles}
                                classNamePrefix="react-select"
                                value={{ label: 'Walk-in (Self)', value: 'self' }}
                                isDisabled={true}
                                options={[{ label: 'Walk-in (Self)', value: 'self' }]}
                            />
                        </div>
                    </div>
                </>
            )}
            {typeof billingdata.billingSource === 'number' && billingdata.billingSource > 0 && (
                <div>
                    <label className="pls-label text-sm">Select Urgency</label>
                    <Select
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={reactSelectCustomStyles}
                        value={{ label: billingdata.status, value: billingdata.status }}
                        onChange={handleUrgencyChange}
                        options={urgencyOptions}
                    />
                </div>
            )}
        </div>
    );
}