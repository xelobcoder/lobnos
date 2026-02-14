import { useContext, useState } from 'react';
import Select from 'react-select';
import { RiAddLine } from '@remixicon/react';
import { MultiBillingContext } from '../../Multi/MultiBillingContext';
import { useApplication } from '../../../Auth/useApplicationContext';

export default function MultiServicesSearchComponent({ updatefunction }) {
    const context = useContext(MultiBillingContext);
    const billingdata = context?.billingdata;
    const applicatonsettings = useApplication();
    const role = applicatonsettings?.user?.role;
    const isAllowCrmToGiveDisocunt = ['manager', 'admin'].includes(role || '') ?
        true : parseInt(applicatonsettings?.settings?.AllowCrmToGiveDisocunt || "0") == 1 ? true : false;
    const servicesList = billingdata?.servicesList || []
    const includeServices = billingdata?.includeServices;
    const [selectedServices, setSelectedServices] = useState<any>(null);

    if (!includeServices) return null;


    if (!servicesList || servicesList.length === 0) {
        return (
            <tr>
                <td colSpan={4} className="text-center text-muted">
                    No services available to select.
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td colSpan={2}>
                <Select
                    onChange={(newValue) => {
                        setSelectedServices(newValue);
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    options={servicesList}
                    getOptionLabel={(option) => option.label || option.serviceName || String(option.keyid)}
                    getOptionValue={(option) => option.keyid}
                    value={selectedServices}
                    isClearable
                />
            </td>
            <td></td>
            <td>
                <select className='form-select' onChange={(ev) => {
                    setSelectedServices({ ...selectedServices, userAdjustmentType: ev.target.value })
                }}>
                    <option value="">Select Adjustment Type</option>
                    <option value='surcharge'>surcharge</option>
                    <option value='discount'>discount</option>
                </select>
            </td>
            <td>
                <input
                    disabled={!isAllowCrmToGiveDisocunt}
                    value={selectedServices?.discount ?? ''}
                    onChange={(ev) => {
                        setSelectedServices({ ...selectedServices, discount: ev.target.value,userAdjustedValue: ev.target.value });
                    }}
                    className='custom-input col-8' type='number'
                    placeholder="Discount"
                />
                {!isAllowCrmToGiveDisocunt && (
                    <span className="text-muted small">Discount input only available after authorization given</span>
                )}
            </td>
            <td>
                <button
                    onClick={() => {
                        if (selectedServices) {
                            updatefunction(selectedServices?.userAdjustedValue ? selectedServices : {
                                ...selectedServices,
                                discount: 0
                            });
                            setSelectedServices(null);
                        }
                    }}
                    className='btn btn-secondary btn-sm'
                    disabled={!selectedServices}
                >
                    <RiAddLine size={18} />
                </button>
            </td>
        </tr>
    );
}


