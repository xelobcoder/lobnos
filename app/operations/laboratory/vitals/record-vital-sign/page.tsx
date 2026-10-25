'use client';
import { useSearchParams } from 'next/navigation';
import RecordVitalSignsChartForm from '../../../../../components/customer/vitalSignChartForms';
export default function RecordVitalSigns() {
    const params = useSearchParams();
    return <RecordVitalSignsChartForm key={params?.get('patientid') || 'search'} searchParams={{ patientid: params?.get('patientid') }} />;
}
