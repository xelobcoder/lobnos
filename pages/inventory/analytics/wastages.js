import InventoryLayout from "../../../components/inventory/InventoryLayout";
import CardRacks from '../../../components/accessories/CardRacks';
export default function InventoryWastages() {
   return (
      <InventoryLayout>
         <div className="grid-30-30-30">
         <CardRacks  header={<h6>1st Quarter</h6>}/>
         <CardRacks header={<h6>2nd Quarter</h6>}/> 
         <CardRacks header={<h6>3rd Quarter</h6>}/>
        </div>
      </InventoryLayout>
   )
}