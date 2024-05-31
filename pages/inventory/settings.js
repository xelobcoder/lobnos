import InventoryLayout from "../../components/inventory/InventoryLayout";
import CardRacks from '../../components/accessories/CardRacks.jsx';
import { inventorySettings,updateInventorySettings } from "../../components/inventory/Util.js";
import { useState } from "react";
import { ToastContainer ,toast} from "react-toastify";
export default function InventorySettings() {
   const [settings, setSettings] = useState(inventorySettings);
   const updateSettings = () => updateInventorySettings(settings, toast);
   
   return (
      <InventoryLayout>
         <ToastContainer/>
         <CardRacks header={<h5>Customization settings</h5>}
            body={
               <div className="px-3">
                  <div className="grid-50 p-2 border-bottom mb-2">
                     <span>Days to expiry date</span>
                        <input className="custom-input"
                        onChange={(ev) => {setSettings({...setSettings, alertdays: parseInt(ev.target.value)})}}
                        value={settings.alertdays} type='number' step={1} min={0} />
                  </div>
                  <div className="grid-50 p-2 ">
                     <span>Automatic deduction of stock(this deduct brands and batch number following the nearest to expire)</span>
                     <select
                        onChange={(ev) =>  {setSettings({...settings,stocksAutoDeduct: JSON.parse( ev.target.value)})}}
                        className="custom-select">
                           <option value={true}>Yes</option>
                           <option value={false}>No</option>
                     </select>
                  </div>
               </div>
           }
            footer={
               <div className="d-flex justify-content-end">
                  <button
                   onClick={updateSettings}
                     className="btn btn-primary btn-sm ">update settings</button>
              </div>
            }
         />
     </InventoryLayout>
   )
}