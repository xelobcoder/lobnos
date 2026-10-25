'use client';
import { use } from 'react';
import StrategyAssignment from '../../../../../../components/Billing/billing-strategy/StrategyAssignment';
export default function AccountStrategyPage({ params }: { params: Promise<{ entitytype: string; entityid: string }> }) {
    const { entitytype, entityid } = use(params);
    return <StrategyAssignment entityType={entitytype} entityId={entityid}/>;
}
