import { useEffect, useState } from "react";
import InventoryLayout from "../../../components/inventory/InventoryLayout";
import { getStocks } from '../../../components/inventory/Util';
import CustomAutocomplete from "../../../components/accessories/CustomAutoComplete";
import { customPost } from "../../../components/Auth/customFetch";

export default function PurchaseOrderAnalytics() {
  const [stocks, setStocks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    getStocks(`page=${1}&&count=${20}`, setStocks);
  }, []);

  const handleAutocompleteChange = (value) => setSelected(value);


  const AppendToCart = (value) => setCart([...cart, value]);

  const get_stock_p_order = async (stockid, records = 5) => {
    if (!stockid) return;
    const pushResponse = await customPost('inventory/analytics/purchasetoconsume', 'POST', { stockid, records });
  return pushResponse;
  }

  useEffect(() => {
    get_stock_p_order(2,10);
  },[])

  return (
    <InventoryLayout>
      
      <section className="mx-2">
        <h6 className="lims-color">Inventory</h6>
      </section>
    </InventoryLayout>
  )
}
