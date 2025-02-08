import React from 'react';
import ClinicianFiltering from '../../../accessories/SectorFileringComponents/ClinicianFiltering';
import InsuranceOrganizationFiltering from '../../../accessories/SectorFileringComponents/InsuranceOrganizationFiltering';
import OrganizationalBillingSourceSearch from '../BillingSourceComponents/OrganizationBillingSearch';

const BillingSourceComponent = ({ billingSource, updateValuesToContext, handleInsuranceSelection, handleClinicianSelection, isClient }) => {
    switch (billingSource) {
        case 2:
            return (
                <div className="mb-2">
                    <OrganizationalBillingSourceSearch updatefunction={updateValuesToContext} />
                </div>
            );
        case 3:
            return (
                <div className="form-group">
                    <label>search organization here</label>
                    {isClient && < InsuranceOrganizationFiltering onSelect={handleInsuranceSelection} />}
                </div>
            );
        case 4:
            return (
                <div className="form-group">
                    <label>search organization here</label>
                    <input type='text' placeholder="Get Claim Code Here" className="custom-input" />
                </div>
            );
        case 6:
            return (
                <div className="form-group">
                    <label>search clinician here</label>
                    <ClinicianFiltering onSelect={handleClinicianSelection} />
                </div>
            );
        default:
            return null;
    }
};

const RenderingBillingSourceLayout = ({ billingdata, updateValuesToContext, handleInsuranceSelection, handleClinicianSelection, isClient }) => {
    return (
        <div>
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