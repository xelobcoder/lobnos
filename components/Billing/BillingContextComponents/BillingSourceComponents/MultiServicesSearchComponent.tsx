import { useContext, useState } from 'react';
import Select from 'react-select';
import { RiAddLine } from '@remixicon/react';
import { MultiBillingContext } from '../../Multi/MultiBillingContext';
import { useApplication } from '../../../Auth/useApplicationContext';

export default function MultiServicesSearchComponent({ updatefunction }) {
    const context = useContext(MultiBillingContext);
    const billingdata = context?.billingdata;
    const role = useApplication().user?.role 
    const servicesList = billingdata?.servicesList || [];
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
            <td>
                <input
                    disabled={role !== "admin"}
                    value={selectedServices?.discount ?? ''}
                    onChange={(ev) => {
                        setSelectedServices({ ...selectedServices, discount: ev.target.value });
                    }}
                    className='custom-input col-8' type='number'
                    placeholder={role !== "admin" ? "Admin only" : "Discount"}
                    style={{ display: role === "admin" ? 'block' : 'none' }}
                />
                {role !== "admin" && (
                    <span className="text-muted small">Discount input only available for admin</span>
                )}
            </td>
            <td>
                <button
                    onClick={() => {
                        if (selectedServices) {
                            updatefunction(selectedServices?.discount ? selectedServices : {
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


