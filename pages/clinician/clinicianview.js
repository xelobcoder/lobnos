import { useSearchParams } from 'next/navigation';
import ClinicianGeneralSalesChart from '../../components/Dashboards/ClinicianGeneralSales';
import FrontDeskLayout from '../../components/Layout/FrontDeskLayout';

export default function ClinicianView() {
  const clinicianid = useSearchParams().get('clinicianid');
  
  return (
    <FrontDeskLayout>
      <ClinicianGeneralSalesChart clinicianid={clinicianid} />
    </FrontDeskLayout>
  );
}
