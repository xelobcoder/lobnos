import { useState, useEffect } from 'react';
import { Dropdown, ButtonGroup } from 'react-bootstrap';
import { BillingStrategy } from './BillingStrategyTypes';
import { customFetch } from '../../Auth/customFetch';
import PrimeTable from '../../accessories/Datatables/PrimeTable';


export default function StrategiesPage() {
    const [strategies, setStrategies] = useState<BillingStrategy[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);



    async function fetchStrategies() {
        setLoading(true);
        setError(null);
        try {
            const response = await customFetch('billing/strategy/advanced/strategies/all');
            if (response && Array.isArray(response) && response.length > 0) {
                setStrategies(response);
            } else {
                setError(response.error || 'Failed to load strategies');
            }
        } catch (err) {
            setError(err.message || 'Failed to load strategies');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStrategies();
    }, []);




    const columns = [
        { Header: 'ID', accessor: 'id' as keyof BillingStrategy },
        { Header: 'Name', accessor: 'name' as keyof BillingStrategy },
        { Header: 'Description', accessor: 'description' as keyof BillingStrategy },
        { Header: 'Is Discount', accessor: (row: BillingStrategy) => (row.is_discount === 1 ? 'Yes' : 'No') },
        { Header: 'Applies to All', accessor: (row: BillingStrategy) => (row.applies_to_all_tests === 1 ? 'Yes' : 'No') },
        { Header: 'Priority', accessor: 'priority' as keyof BillingStrategy },
        { Header: 'Apply Time Based', accessor: (row: BillingStrategy) => (row.apply_time_based == 1 ? 'Yes' : 'No') },
        { Header: 'Created At', accessor: (row: BillingStrategy) => row.created_at ? new Date(row.created_at).toLocaleString() : '' },
        { Header: 'Updated At', accessor: (row: BillingStrategy) => row.updated_at ? new Date(row.updated_at).toLocaleString() : '' },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }: { row: { original: BillingStrategy } }) => (
                <Dropdown as={ButtonGroup} id='dropdown'>
                    <Dropdown.Toggle >
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item href={`/billing/advanced-billing-strategy/strategies/conditions/${row.original.id}?is_applicable_to_all_test=${row.original.applies_to_all_tests}`}>
                            Select Pricing Mode
                        </Dropdown.Item>
                        <Dropdown.Item href={`/billing/advanced-billing-strategy/strategies/conditions/${row.original.id}?is_applicable_to_all_test=${row.original.applies_to_all_tests}`}>
                            Create Conditions
                        </Dropdown.Item>
                        <Dropdown.Item>
                            Add Applicable Test
                        </Dropdown.Item>
                        <Dropdown.Item href={`/billing/advanced-billing-strategy/create-strategy?isEdit=true&&id=${row.original.id}`} >Edit</Dropdown.Item>
                        <Dropdown.Item href={`/billing/advanced-billing-strategy/strategies/${row.original.id}`}>Add Condition</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )
        }
    ]


    return (
        <div className="p-4">
            {loading && <p>Loading strategies...</p>}
            {error && <p className="text-danger">Error: {error}</p>}
            {!loading && !error && (
                <div>
                    <div className='d-flex justify-content-end'>
                        <button className='btn btn-primary btn-sm'>
                            Create New Billing Pricing
                        </button>
                    </div>
                    <PrimeTable
                        column={columns}
                        data={strategies}
                        serverSideFiltering={true}
                        handleSeverSideProcessing={null}
                    />
                </div>
            )}
        </div>
    );
}
