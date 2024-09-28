import { useContext, useEffect, useState } from 'react';
import Select from 'react-select';
import { fetchServices } from '../../../../lib/billingLib';
import { currencyFormatter } from '../../../Auth/customFetch';
import AuthContext from '../../../Auth/useAuthentification';

export default function ServicesSearchComponent({ updatefunction }) {
    const [servicesList, setServicesList] = useState([]);
    const [selectedServices, setSelectedServices] = useState(null);
    const { auth } = useContext(AuthContext);
    const { role } = auth;

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
        <div className='d-flex'>
            <div className='col-3'>
                <Select
                    onChange={(newValue) => {
                        setSelectedServices(newValue);
                    }}
                    options={servicesList}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.keyid}
                />
            </div>
            <input disabled={role != "admin"}
                onChange={(ev) => { setSelectedServices({ ...selectedServices, discount: ev.target.value }) }}
                className='custom-input col-2 mx-3' type='number' />
            <button
                onClick={(ev) => { updatefunction(selectedServices) }}
                className='btn btn-secondary btn-sm'>
                add service
            </button>
        </div>
    );
}
