"use client"
import React from 'react'
import BillingStrategyAssignmentForm from '../../../../../components/Billing/billing-strategy/BillingStrategyAssignmentForm'
import { useSearchParams } from 'next/navigation'


export default function Page() {
    const searchParams = useSearchParams();
    const trackId = searchParams?.get('trackId');
    const billing_strategy_id = searchParams?.get('billing_strategy_id');
    const entity_type = searchParams?.get('entity_type') as 'insurance' | 'clinician' | 'organization' | 'general';

    if (!trackId || !entity_type) return <h1>Unknown Entity Type</h1>

    const parsedTrackId = parseInt(trackId.toString())
    const parsed_billing_strategy_id = billing_strategy_id ? parseInt(billing_strategy_id.toString()) : null;
    
    return (
        <div>
            <BillingStrategyAssignmentForm
                billing_strategy_id={parsed_billing_strategy_id}
                trackId={parsedTrackId}
                entity_type={entity_type} />
        </div>
    )
}
