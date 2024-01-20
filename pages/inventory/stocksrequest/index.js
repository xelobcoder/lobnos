import { getDataAndUpdateState, getDepartment } from "../../../components/Auth/customFetch";
import InventoryLayout from "../../../components/inventory/InventoryLayout";
import { useEffect, useState } from "react";
import Loader from '../../../components/accessories/Loader';
import DepartmentSummaryPendingView from "../../../components/inventory/stocks/DepartmentSummaryView";

export default function GeneralStoreRequestSummary() {
   const [departments, setDepartments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [active, setActive] = useState(0);
   useEffect(() => {
      async function getdata() {
         setLoading(true);
         await getDataAndUpdateState(setDepartments, 'departments/requisitions/summary');
         setLoading(false);
      };
      getdata();
   }, []);

   const RackClicked = (id) => {
      setActive(id);
   }
   

   return (
      <InventoryLayout>
         <h4>Department Pending Requisitions</h4>
         <section>
         {
            loading ?
            <Loader />
            :
            <DepartmentSummaryPendingView active={active} handleClick={RackClicked} data={departments}/>
         }
         </section>
         <section>
           <h1> display list here</h1> 
         </section>
      </InventoryLayout>
   )
}