import { useState } from "react";
import Loader from "../../../../components/accessories/Loader";
import SidebarFrontPage from "../../../../components/frontpagesidebar";
import SettingsLayout from "../../../../components/settingsComponents/SettingsLayout";

export default function TodaySales() {
   const [isloading, setLoading] = useState(false);

   const rendering = () => {
      if (isloading) return <Loader />
      else {
         return <h5>Today sales</h5>
      }
   }
   return (
      <SettingsLayout sidebar={<SidebarFrontPage />}>
         <h4>Today sales</h4>
         {rendering()}
      </SettingsLayout>
   )
}