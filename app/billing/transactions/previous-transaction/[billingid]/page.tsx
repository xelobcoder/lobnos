"use client";
import {useParams} from 'next/navigation';
import PreviousTransactionWorkspace from './PreviousTransactionWorkspace';

export default function PreviousTransactionSummaryPage() {
    const params = useParams<{billingid: string}>();
    return <PreviousTransactionWorkspace billingid={params?.billingid}/>;
}
