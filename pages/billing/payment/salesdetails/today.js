import Loader from "../../../../components/accessories/Loader";
import SidebarFrontPage from "../../../../components/frontpagesidebar";
import SettingsLayout from "../../../../components/settingsComponents/SettingsLayout";

export default function TodaySales() {
   return (
      <SettingsLayout sidebar={<SidebarFrontPage />}>
         <Loader/>
      </SettingsLayout>
   )
}