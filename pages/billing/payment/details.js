import SidebarFrontPage from "../../../components/frontpagesidebar";
import SettingsLayout from "../../../components/settingsComponents/SettingsLayout";

export default function BillingDetails() {
   return (
      <SettingsLayout sidebar={<SidebarFrontPage />}>
         <h4>Billing Details</h4>
      </SettingsLayout>
   )
}