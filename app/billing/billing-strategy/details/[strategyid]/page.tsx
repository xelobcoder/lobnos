'use client';
import { use } from 'react';
import StrategyDetails from '../../../../../components/Billing/billing-strategy/StrategyDetails';
export default function BillingStrategyDetails({ params }: { params: Promise<{ strategyid: string }> }) {
    return <StrategyDetails strategyId={use(params).strategyid}/>;
}
