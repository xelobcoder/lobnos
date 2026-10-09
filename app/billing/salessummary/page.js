'use client'
import GeneralSalesChart from "../../../components/Dashboards/GeneralSalesCharts"
import Authorization from '../../../components/accessories/authorization';
import Loader from "../../../components/accessories/Loader";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
export default function SalesSummaryPage() {
  const { applicationsettings } = useApplicationSettings();
  const { employeeid, role } = applicationsettings.user;

  const renderingView = () => {
    if (applicationsettings.user && role) {
      if (['manager', 'admin', 'super-admin'].includes(role)) {
        return <GeneralSalesChart />
      } else {
        return <Authorization />
      }
    } else {
      return <Loader />
    }
  }
  return (
   <div>
    {renderingView()} 
   </div>
  )
}
