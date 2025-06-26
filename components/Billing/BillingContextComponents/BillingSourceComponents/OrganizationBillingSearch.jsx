import { useState } from 'react';
import Select from 'react-select';
import { Card } from 'react-bootstrap';
import { customFetch, reactSelectCustomStyles } from '../../../Auth/customFetch';

export default function OrganizationalBillingSourceSearch({ updatefunction, isDisabled = false }) {
    
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState([]);

    const LoadInit = async () => {
        setLoading(true); // Always set loading true before fetch
        try {
            const { organizations } = await customFetch("organization");
            if (organizations && Array.isArray(organizations) && organizations.length > 0) {
                setOrganizations(organizations);
            } else {
                setOrganizations([]);
            }
        } catch (err) {
            setOrganizations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleManualReload = () => {
        setOrganizations([]);
        setLoading(true);
        LoadInit();
    };

    return (
        <Card>
            <Card.Body>
                <div className="d-flex align-items-center mb-2 bg-secondary bg-opacity-10 p-2 rounded">
                    <label className="mb-0 me-2">Organization Name</label>
                    <button
                        className="btn btn-sm btn-outline-primary ms-auto"
                        type="button"
                        onClick={handleManualReload}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Load '}
                    </button>
                </div>
                <Select
                    isDisabled={organizations.length == 0 || loading || isDisabled}
                    placeholder={loading ? 'Loading data ...' : "Search  here"}
                    onChange={(newValue) => { updatefunction({ ...newValue, organizations }) }}
                    options={organizations}
                    getOptionLabel={(option) => option.name}
                    styles={reactSelectCustomStyles}
                    getOptionValue={(option) => option.id}
                />
            </Card.Body>
        </Card>
    )
}