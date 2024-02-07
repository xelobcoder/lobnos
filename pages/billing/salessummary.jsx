import SidebarFrontPage from "../../components/frontpagesidebar"
import SettingsLayout from "../../components/settingsComponents/SettingsLayout"

export default function SalesSummaryPage() {
  return (
    <SettingsLayout sidebar={<SidebarFrontPage />}>
      <h1>sales summary</h1>
    </SettingsLayout>
  )
}
