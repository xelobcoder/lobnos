import { useContext, useEffect, useState } from 'react';
import Select from 'react-select';
import { fetchServices } from '../../../../lib/billingLib';
import { currencyFormatter, reactSelectCustomStyles } from '../../../Auth/customFetch';
import AuthContext from '../../../Auth/useAuthentification';
import { Add } from '@mui/icons-material';

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
        <tr>
            <td colSpan={2}>
                <Select
                    onChange={(newValue) => {
                        setSelectedServices(newValue);
                    }}
                    options={servicesList}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.keyid}
                />
            </td>
            <td>
                <input disabled={role != "admin"}
                    onChange={(ev) => { setSelectedServices({ ...selectedServices, discount: ev.target.value }) }}
                    className='custom-input col-8' type='number' />
            </td>
            <td>
                <button
                    onClick={(ev) => { updatefunction(selectedServices) }}
                    className='btn btn-secondary btn-sm'>
                    <Add/>
                </button>
            </td>
        </tr>
    );
}


