"use client"
import React from 'react'
import BillingStrategyForm from '../../../../components/Billing/billing-strategy/BillingStrategyForm'
import { toast } from 'react-toastify';
import { customPost } from '../../../../components/Auth/customFetch';
import { BillingStrategy } from '../../../../components/Billing/billing-strategy/BillingStrategyTypes';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();
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
                toast.success(" Strategy created successfully");
            } else {
                toast.error("Failed to create strategy" + error);
            }
        } catch (error) {
            toast.error("something wrong occured");
        }
    };


    return (
        <div>
            <div className='d-flex justify-content-end'>
                <button onClick={(ev) => { router.push('/billing/advanced-billing-strategy/strategies') }} className='btn btn-primary mb-2 btn-sm'>
                    View Strategie List
                </button>
            </div>
            <BillingStrategyForm onSubmit={handleSubmit} />
        </div>
    )
}
