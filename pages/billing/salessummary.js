import GeneralSalesChart from "../../components/Dashboards/GeneralSalesCharts"
import SidebarFrontPage from "../../components/frontpagesidebar"
import SettingsLayout from "../../components/settingsComponents/SettingsLayout"

export default function SalesSummaryPage() {
  return (
    <SettingsLayout sidebar={<SidebarFrontPage />}>
      <GeneralSalesChart />
    </SettingsLayout>
  )
}
