import { useEffect, useState } from 'react';
import Select from 'react-select';
import { customFetch } from '../../../Auth/customFetch';

export default function OrganizationalBillingSourceSearch({ updatefunction }) {
    const [loading, setLoading] = useState(true);
    const [organizations, setOrganizations] = useState([]);

    const LoadInit = async () => {
        try {
            const { organizations } = await customFetch("organization");
            if (organizations && Array.isArray(organizations) && organizations.length > 0) {
                setOrganizations(organizations);
            }
            setLoading(false);
        } catch (err) {
            setOrganizations([])
            setLoading(false);
        }
    }

    useEffect(() => { LoadInit() }, [])

    return (
        <div>
            <label>Organization Name</label>
            <Select
                isDisabled={organizations.length == 0}
                placeholder={loading ? 'Loading data ...' : "Search organization here"}
                onChange={(newValue) => { updatefunction({...newValue,organizations}) }}
                options={organizations}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
            />
        </div>
    )
}