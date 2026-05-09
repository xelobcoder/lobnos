"use client"
import { useSearchParams } from 'next/navigation';
import ClinicianGeneralSalesChart from '../../../components/Dashboards/ClinicianGeneralSales';

export default function ClinicianView() {
  const clinicianid = useSearchParams()?.get('clinicianid');

  return (
  <div>
    <h1>Still Under Development</h1>
      {/* <ClinicianGeneralSalesChart clinicianid={clinicianid} /> */}
  </div>
  );
}
