import { useEffect, useState } from 'react';
import Select from 'react-select';
import { fetchServices } from '../../../../lib/billingLib';
import { currencyFormatter } from '../../../Auth/customFetch';
import { RiAddLine } from '@remixicon/react';
import { useApplicationSettings } from '../../../Auth/useApplicationContext';
import { roleAllowed } from '../../../Auth/roles';

export default function ServicesSearchComponent({ updatefunction }) {
    const [servicesList, setServicesList] = useState([]);
    const [selectedServices, setSelectedServices] = useState(null);
    const { applicationsettings } = useApplicationSettings();
    const { user } = applicationsettings;
    const { role } = user;


    const fetchServicesList = async function () {
        let services = await fetchServices();
        services = services.map((item, index) => {
            return {
                ...item,
                label: `${item.serviceName} (${currencyFormatter.format(item.servicePrice)})`,
            };
        });
        setServicesList(services);
    };

    useEffect(() => {
        fetchServicesList();
    }, []);



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
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.keyid}
                />
            </td>
            <td>
                <input disabled={!roleAllowed(role, ["admin"])}
                    onChange={(ev) => { setSelectedServices({ ...selectedServices, discount: ev.target.value }) }}
                    className='custom-input col-8' type='number' />
            </td>
            <td>
                <button
                    onClick={(ev) => {
                        updatefunction(selectedServices?.discount ? selectedServices : {
                            ...selectedServices,
                            discount: 0
                        })
                    }}
                    className='btn btn-secondary btn-sm'>
                    <RiAddLine size={18} />
                </button>
            </td>
        </tr>
    );
}


