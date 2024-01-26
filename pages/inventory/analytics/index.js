import { useEffect, useState } from "react";
import InventoryLayout from "../../../components/inventory/InventoryLayout";
import { getStocks } from '../../../components/inventory/Util';
import CustomAutocomplete from "../../../components/accessories/CustomAutoComplete";
import { customPost } from "../../../components/Auth/customFetch";
import SummaryInventoryAnalytics from "../../../components/inventory/stocks/analytics/summaryInventory";

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
    console.log(pushResponse);
  }

  useEffect(() => {
    get_stock_p_order(2,10);
  },[])

  return (
    <InventoryLayout>
      <SummaryInventoryAnalytics />
      <section className="grid-50">
      <div className="d-flex justify-content-between" id="csautowrapper" >
              <div className="d-flex" style={{zIndex:1000}}>
                <CustomAutocomplete
                  target="name"
                  data={stocks || []}
                  label='search stocks here'
                  style={{
                    width: "30vw",
                    maxHeight: "30vh",
                    overflowY: "auto",
                  }}
                  onChange= {handleAutocompleteChange}
                />
              <div>
              <button
                onClick={(ev) => { AppendToCart(selected) }}
                className="btn btn-primary btn-sm mx-2"> add stock</button>
              </div>
            </div>
          </div>
          <div className="mx-2">
              <select className="custom-select">
                <option value="">Select records</option>
                <option value={5}>Last 5 records</option>
                <option value={10}>Last 10 records</option>
                <option value={20}>Last 20 records</option>
            </select>
            <div className="d-flex my-2">
                <div className="ptoO">
                  <span>Duration between P0 to GRN</span>
                </div>
                <div className="ptoO mx-3">
                  <span>Duration in main store</span>
                </div>
                <div className="ptoO">
                  <span>Time to consume stock</span>
                </div>
            </div>
          </div>
      </section>
      <section className="mx-2">
        <h6 className="lims-color">Inventory</h6>
      </section>
    </InventoryLayout>
  )
}
