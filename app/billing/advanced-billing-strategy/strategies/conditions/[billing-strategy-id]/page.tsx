'use client'
import {errorMessage} from '../../../../../../lib/errorMessage';
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation';
import { customFetch } from '../../../../../../components/Auth/customFetch';
import BillingStrategyPriceForm from '../../../../../../components/Billing/billing-strategy/BillingStrategyPriceForm';
import { Spinner } from 'react-bootstrap';

export default function BillingStrategyPage() {
    const [testPanels, setTestPanels] = useState<TestPanel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const params = useParams();
    const searchParams = useSearchParams();

    const billing_strategy_id = params?.['billing-strategy-id'];
    const is_applicable_to_all_test = searchParams?.get('is_applicable_to_all_test') === 'true';

    const fetchAllTestPanels = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await customFetch("testpanel/list/bulk/billing");
            if (response?.data && Array.isArray(response.data)) {
                setTestPanels(response.data);
            } else {
                setError('No test panels available');
            }
        } catch (err) {
            setError(errorMessage(err) || 'Failed to load test panels');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTestPanels();
    }, []);

    if (!billing_strategy_id) {
        return <div className="alert alert-danger">Missing billing strategy ID</div>;
    }

    if (loading) {
        return <div className="text-center py-4"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    if (!is_applicable_to_all_test && testPanels.length === 0) {
        return <div className="alert alert-info">No test panels available for this strategy</div>;
    }

    return (
        <div className="container py-4">
            <BillingStrategyPriceForm
                billing_strategy_id={Number(billing_strategy_id)}
                test_panels={testPanels}
                is_applicable_to_all_test={is_applicable_to_all_test}
            />
        </div>
    );
}

interface TestPanel {
    id: number;
    testid: number;
    name: string;
    discountedValue: number;
    isoutsourced: number;
}