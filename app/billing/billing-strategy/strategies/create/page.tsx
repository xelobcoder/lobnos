'use client';
import { useSearchParams } from 'next/navigation';
import StrategyEditor from '../../../../../components/Billing/billing-strategy/StrategyEditor';
export default function BillingStrategyForm() {
    const searchParams = useSearchParams();
    return <StrategyEditor strategyId={searchParams.get('id')}/>;
}
