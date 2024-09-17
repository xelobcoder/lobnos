import { useEffect, useState } from 'react';
import Select from 'react-select';
import { fetchServices } from '../../../../lib/billingLib';
import { currencyFormatter } from '../../../Auth/customFetch';

export default function ServicesSearchComponent({ updatefunction }) {
    const [servicesList, setServicesList] = useState([]);

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
        <div>
            <Select
                onChange={(newValue) => {
                    updatefunction(newValue);
                }}
                options={servicesList}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.keyid}
            />
        </div>
    );
}
