import { useState } from "react";
import InventoryLayout from "../../../components/inventory/InventoryLayout";
import SummaryInventoryAnalytics from "../../../components/inventory/stocks/analytics/summaryInventory"
import InventoryUrgentActionsView from "../../../components/inventory/stocks/analytics/urgentActions";
import OrdersSummary from "../../../components/inventory/stocks/analytics/OrdersSummary";
export default function InventoryAnalyticsIndexPage() {
   const [render, setRender] = useState(null);


   const upCall = (value) => { setRender(value) }
   return (
      <InventoryLayout>
         <SummaryInventoryAnalytics upCall={upCall} />
         {render === 1 && (<InventoryUrgentActionsView />)}
         {render === 2 && (<OrdersSummary />)}
      </InventoryLayout>
   )
}