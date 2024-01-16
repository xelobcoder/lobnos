import { useSearchParams } from "next/navigation";
import StockListView from "../../../components/inventory/stocks/StockListView";
import StockBrandList from "../../../components/inventory/stocks/StockBrandList";
import InventoryLayout from "../../../components/inventory/InventoryLayout";

export default function StockBrandIndexPage() {
   const stockname = useSearchParams().get('stockname');
   const stockid = useSearchParams().get('stockid');
   return (
      <InventoryLayout>
        <StockBrandList id={stockid} stockname={stockname} />
     </InventoryLayout>
   )
}