import React from 'react';
import ClinicianFiltering from '../../../accessories/SectorFileringComponents/ClinicianFiltering';
import InsuranceOrganizationFiltering from '../../../accessories/SectorFileringComponents/InsuranceOrganizationFiltering';
import OrganizationalBillingSourceSearch from '../BillingSourceComponents/OrganizationBillingSearch';
import { Form, Card } from 'react-bootstrap';
import { RiHospitalLine, RiUserHeartLine, RiFileLine } from '@remixicon/react';

interface SourceCallbacks {
    updateValuesToContext: (entity: {id: number; name: string}) => void;
    handleInsuranceSelection: (entity: {id: number; insuranceName: string}) => void;
    handleClinicianSelection: (entity: {id: number; name: string}) => void;
    isClient?: boolean;
}
const BillingSourceComponent = ({ billingSource, updateValuesToContext, handleInsuranceSelection, handleClinicianSelection, isClient }: SourceCallbacks & {billingSource?: number}) => {
    
    const renderSourceIcon = () => {
        switch (billingSource) {
            case 2: return <RiHospitalLine className="text-primary mb-2" size={24} />;
            case 3: return <RiHospitalLine className="text-success mb-2" size={24} />;
            case 4: return <RiFileLine className="text-info mb-2" size={24} />;
            case 6: return <RiUserHeartLine className="text-warning mb-2" size={24} />;
            default: return null;
        }
    };

    const getSourceTitle = () => {
        switch (billingSource) {
            case 2: return "Organization Billing";
            case 3: return "Insurance Organization";
            case 4: return "Claim Code";
            case 6: return "Clinician Search";
            default: return "";
        }
    };

    return (
    <div>
        {typeof billingSource == "number" && billingSource > 1 && 
        (
            <Card className=" mb-3 mt-3 mx-0">
            <Card.Body>
                <div className="text-center">
                    {renderSourceIcon()}
                    <h6 className="mb-3">{getSourceTitle()}</h6>
                </div>

                {billingSource === 2 && (
                    <OrganizationalBillingSourceSearch updatefunction={updateValuesToContext} />
                )}

                {billingSource === 3 && (
                    <Form.Group>
                        <Form.Label className="small text-muted">Search Organization</Form.Label>
                        {isClient && (
                            <div className="position-relative">
                                <InsuranceOrganizationFiltering onSelect={handleInsuranceSelection} />
                            </div>
                        )}
                    </Form.Group>
                )}

                {billingSource === 4 && (
                    <Form.Group>
                        <Form.Label className="small text-muted">Claim Code</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Enter claim code"
                            className="rounded-3 border-light"
                        />
                    </Form.Group>
                )}

                {billingSource === 6 && (
                    <Form.Group>
                        <Form.Label className="small text-muted">Search Clinician</Form.Label>
                        <div className="position-relative">
                            <ClinicianFiltering onSelect={handleClinicianSelection} />
                        </div>
                    </Form.Group>
                )}
            </Card.Body>
        </Card>
        )}
    </div>
    );
};

const RenderingBillingSourceLayout = ({ billingdata, updateValuesToContext, handleInsuranceSelection, handleClinicianSelection, isClient }: SourceCallbacks & {billingdata: {billingSource?: number}}) => {
    return (
        <div >
            <BillingSourceComponent
                isClient={isClient}
                billingSource={billingdata?.billingSource}
                updateValuesToContext={updateValuesToContext}
                handleInsuranceSelection={handleInsuranceSelection}
                handleClinicianSelection={handleClinicianSelection}
            />
        </div>
    );
};


export default RenderingBillingSourceLayout