import GeneralSalesChart from "../../components/Dashboards/GeneralSalesCharts"
import SidebarFrontPage from "../../components/frontpagesidebar"
import SettingsLayout from "../../components/settingsComponents/SettingsLayout"
import CardRacks from '../../components/accessories/CardRacks';

export default function SalesSummaryPage() {
  return (
    <SettingsLayout sidebar={<SidebarFrontPage />}>
      <div className="grid-5">
        <CardRacks header={<h6 className="m-0">Today Sales</h6>} />
        <CardRacks header={<h6 className="m-0">week sales</h6>} />
        <CardRacks header={<h6 className="m-0">Month sales</h6>} />
        <CardRacks header={<h6 className="m-0">Year Sales</h6>} />
        <CardRacks header={<h6 className="m-0">Month sales</h6>} />
      </div>
      <GeneralSalesChart />
    </SettingsLayout>
  )
}
