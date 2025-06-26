import { useState } from 'react';
import BillingStrategyForm from './BillingStrategyForm';
import StrategiesPage from './StrategiesPageList';
import { BillingStrategy } from './BillingStrategyTypes';
import { customPost } from '../../Auth/customFetch';
import { toast } from 'react-toastify';

export default function StrategyManagementPage() {
    const [strategies, setStrategies] = useState<BillingStrategy[]>([]);

    const handleSubmit = async (data: {
        name: string;
        is_discount: boolean;
        applies_to_all_tests: boolean;
        apply_time_based: boolean;
        priority: number;
        description?: string;
    }) => {
        try {
            const payload: BillingStrategy = {
                ...data,
                is_discount: data.is_discount ? 1 : 0,
                applies_to_all_tests: data.applies_to_all_tests ? 1 : 0,
                apply_time_based: data.apply_time_based ? 1 : 0,
            };

            const response: { status: boolean, id?: number, error?: string } = await customPost(`billing/strategy/advanced/strategies`, 'POST', payload);

            const { status, id, error } = response;
            if (status) {
                toast.success("Strategy created successfully");
                setStrategies([...strategies, { ...payload, id }]);
            } else {
                toast.error("Failed to create strategy" + error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    return (
        <div>
            <BillingStrategyForm onSubmit={handleSubmit} />
            <StrategiesPage />
        </div>
    );
}
