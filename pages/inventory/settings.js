import InventoryLayout from "../../components/inventory/InventoryLayout";
import CardRacks from '../../components/accessories/CardRacks.jsx';
export default function InventorySettings() {
   return (
      <InventoryLayout>
         <CardRacks header={<h4>Customization settings</h4>}
            body={
               <div>
               <div className="grid-50 p-2  border-bottom">
                  <span>Days to expiry date</span>
                  <input className="custom-input " type='number' step={1} min={0} />
               </div>
               <div className="grid-50 p-2 ">
                  <span>Days to expiry date</span>
                  <input className="custom-input" type='number' step={1} min={0} />
                  </div>
               </div>
           }
            footer={
               <div className="d-flex justify-content-end">
                   <button className="btn btn-primary btn-sm ">update settings</button>
              </div>
            }
         />
     </InventoryLayout>
   )
}