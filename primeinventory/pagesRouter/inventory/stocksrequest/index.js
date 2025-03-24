import { getDataAndUpdateState } from "../../../components/Auth/customFetch";
import InventoryLayout from "../../../components/inventory/InventoryLayout";
import { useEffect, useState } from "react";
import Loader from '../../../components/accessories/Loader';
import DepartmentSummaryPendingView from "../../../components/inventory/stocks/DepartmentSummaryView";
import DepartmentalStockRequestServing from "../../../components/inventory/stocks/stockRequest/DepartmentalRequestList";

export default function GeneralStoreRequestSummary() {
     const [departments, setDepartments] = useState([]);
     const [activedept, setActiveDept] = useState(null);
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
          setActiveDept(id);
     }



     return (
          <InventoryLayout>
               <div className="d-flex justify-content-between mx-2">
                    <div >
                         <h4>Department Pending Requisitions</h4>
                    </div>
               </div>
               <section>
                    {
                         loading ?
                              <Loader />
                              :
                              <DepartmentSummaryPendingView active={active} handleClick={RackClicked} data={departments} />
                    }
               </section>
               {activedept &&
                    (
                         <section>
                              <h5 className="btn btn-dark mt-2 mx-2">Requested Items</h5>
                              <DepartmentalStockRequestServing departmentid={activedept} />
                         </section>
                    )}
          </InventoryLayout>
     )
}