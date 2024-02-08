import GeneralSalesChart from "../../components/Dashboards/GeneralSalesCharts"
import SidebarFrontPage from "../../components/frontpagesidebar"
import SettingsLayout from "../../components/settingsComponents/SettingsLayout"
import CardRacks from '../../components/accessories/CardRacks';

export default function SalesSummaryPage() {
  return (
    <SettingsLayout sidebar={<SidebarFrontPage />}>
      <GeneralSalesChart />
    </SettingsLayout>
  )
}
