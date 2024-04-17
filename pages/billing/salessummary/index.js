import { useContext } from "react";
import GeneralSalesChart from "../../../components/Dashboards/GeneralSalesCharts"
import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout";
import AuthContext from "../../../components/Auth/useAuthentification";
import Authorization from '../../../components/accessories/authorization';
import Loader from "../../../components/accessories/Loader";
export default function SalesSummaryPage() {
  const { auth } = useContext(AuthContext);
  const { employeeid, role } = auth;

  const renderingView = () => {
    if (auth && role) {
      if (['manager', 'admin'].includes(role)) {
        return <GeneralSalesChart />
      } else {
        return <Authorization />
      }
    } else {
      return <Loader/>
    }
  }
  return (
    <FrontDeskLayout>
      {renderingView()}
    </FrontDeskLayout>
  )
}
