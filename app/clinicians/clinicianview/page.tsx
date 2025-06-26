"use client"
import { useSearchParams } from 'next/navigation';
import ClinicianGeneralSalesChart from '../../../components/Dashboards/ClinicianGeneralSales';

export default function ClinicianView() {
  const clinicianid = useSearchParams()?.get('clinicianid');
  
  return (
    <ClinicianGeneralSalesChart clinicianid={clinicianid} />
  );
}
