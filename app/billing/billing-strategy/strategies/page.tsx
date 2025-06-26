"use client";

import { useEffect, useState } from 'react';
import { Badge, Spinner } from 'react-bootstrap';
import { customFetch } from '../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { useRouter } from 'next/navigation';
import { RiAddBoxFill } from '@remixicon/react';

interface Strategy {
    strategyid: number;
    name: string;
    description: string;
    concessionMode: "percentage" | "absolute";
    concessionValue: string;
    price_type: "surcharge" | "discount";
    allconcessionApplied: number;
    valid_from: string;
    valid_until: string;
    is_expired: number;
    createdon: string;
    updatedon: string;
    applicableTest: Array<{
        testid: number;
        name: string;
        concessionValue: string;
        discountedValue: string;
        concessionMode: "percentage" | "absolute";
        pricingType: "surcharge" | "discount";
        actualPrice: number;
        originalPrice: number;
    }>;
}

export default function StrategiesListPage() {
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchStrategies = async () => {
        try {
            setLoading(true);
            const response = await customFetch('billing/strategies/all/mini?page=1&count=10');
            if (response && Array.isArray(response) && response.length > 0) {
                setStrategies(response);
            }
        } catch (err) {
            setError('Failed to load strategies');
            toast.error('Failed to load strategies');
        } finally {
            setLoading(false);
        }
    };


    const handleStrategyEditing = (item: { strategyid: number }) => {
        const { strategyid } = item;
        if (!strategyid) return;
        const endpoint = `/billing/billing-strategy/details/${strategyid}`;
        router.push(endpoint);
    };


    const strategyColumns = [
        { Header: 'ID', accessor: 'strategyid' },
        { Header: 'Name', accessor: 'name' },
        {
            Header: 'Description',
            accessor: 'description',
            Cell: ({ value }: { value: string }) => (
                <div style={{ maxWidth: 200,  }}>
                    {value}
                </div>
            )
        },
        { Header: 'Concession Mode', accessor: 'concessionMode' },
        { Header: 'Concession Value', accessor: 'concessionValue' },
        { Header: 'Price Type', accessor: 'price_type' },
        { Header: 'Valid From', accessor: 'valid_from' },
        { Header: 'Valid Until', accessor: 'valid_until' },
        { Header: 'Created On', accessor: 'createdon' },
        { Header: 'Updated On', accessor: 'updatedon' },
        {
            Header: 'Action',
            accessor: (row: Strategy) => formatConcession(row),
            Cell: ({ row }) => {
                console.log("Cell value:", row);
                return (
                    <div className='d-flex justify-content-between align-items-center'>
                        <button onClick={(ev) => { handleStrategyEditing(row.original) }} className="btn btn-sm btn-secondary">
                            Edit
                        </button>
                    </div>
                )
            }
        }
    ];


    useEffect(() => {
        fetchStrategies();
    }, []);

    const formatConcession = (strategy: Strategy) => {
        const value = strategy.concessionMode === 'percentage'
            ? `${strategy.concessionValue}%`
            : `$${parseFloat(strategy.concessionValue).toFixed(2)}`;
        return (
            <Badge bg={strategy.price_type === 'discount' ? 'success' : 'warning'}>
                {value} {strategy.price_type}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }


    if (loading) {
        return (<div className='bg-secondary-subtle br-5 p-3'>
            Loading .................
        </div>)
    }


    const handleSeverSideProcessing = async ({ page, count }: { page: number, count: number }): Promise<{ result?: any[], error: boolean }> => {
        const endpoint = `billing/strategies/all/mini?page=${page}&count=${count}`;
        try {
            const response = await customFetch(endpoint);
            if (response && Array.isArray(response)) {
                return { result: response, error: false };
            } else {
                console.error("Unexpected response format:", response);
                return { result: [], error: true };
            }
        } catch (error) {
            console.error("Error fetching strategies:", error);
            return { result: [], error: true };
        }
    }

    return (
        <div >
            <div className='d-flex justify-content-between'>
                <h5 className='bg-secondary-subtle p-2 br-5 pls-color col-2'>Different Pricings</h5>
                <button className='btn btn-primary float-end mb-2' onClick={() => router.push('/billing/billing-strategy/details/create')}>
                    <RiAddBoxFill />   Create New Strategy
                </button>
            </div>

            <PrimeTable
                serverSideFiltering={true}
                handleSeverSideProcessing={handleSeverSideProcessing}
                column={strategyColumns}
                data={strategies || []}
            />
        </div>
    );
}