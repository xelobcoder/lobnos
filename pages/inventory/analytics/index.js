import InventoryLayout from "../../../components/inventory/InventoryLayout";
import SummaryInventoryAnalytics from "../../../components/inventory/stocks/analytics/summaryInventory"
import InventoryUrgentActionsView from "../../../components/inventory/stocks/analytics/urgentActions";
export default function InventoryAnalyticsIndexPage() {
   return (
      <InventoryLayout>
         <SummaryInventoryAnalytics />
         <InventoryUrgentActionsView/>
      </InventoryLayout>
   )
}