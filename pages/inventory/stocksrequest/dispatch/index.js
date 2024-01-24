import { useEffect, useState } from "react";
import InventoryLayout from "../../../../components/inventory/InventoryLayout";
import { Accordion } from 'react-bootstrap';
import { customFetch } from "../../../../components/Auth/customFetch";
import Loader from "../../../../components/accessories/Loader";
import DispatchStockAccordionList from "../../../../components/inventory/stocks/stockRequest/_DispatchStockAccordionList";
import { getInvSettings, inventorySettings } from "../../../../components/inventory/Util";
import SelectedDeptServe from "../../../../components/inventory/stocks/stockRequest/_SelectedDeptServe";
import { ToastContainer, toast } from 'react-toastify';

export default function DispathApprovedStockToDepart() {
   const [data, setData] = useState([]);
   const [selectedDept, setSelectedDept] = useState(null);
   const [invsettings, setInvsettings] = useState(inventorySettings);
   const [loading, setLoading] = useState(true);

   const updateDept = (id) => setSelectedDept(parseInt(id));

   const removeItem = (id) => {
      setLoading(true);
      const nwData = data.filter((item, index) => { return !(item?.id === id) });
      setData(nwData);
      setLoading(false);
   }
   
   useEffect(() => {
      if (selectedDept) {
         setLoading(true);
         customFetch(`store/departments/requisitions/serve?departmentid=${selectedDept}`)
            .then((data) => { 
               const { statusCode, status, result } = data;
               statusCode === 200 && status === "success" && setData(result);
               setLoading(false);
            })
            .catch((err) => setLoading(false));
         }
   }, [selectedDept])
   
   useEffect(() => { getInvSettings(setInvsettings) }, []);


   const passToast = async (message, type) => {
      if (type === 'success') {
         toast.success(message,{autoClose: 500}); return;
      }
      toast.error(message, { autoClose: 2000 });
   }

   return (
      <InventoryLayout>
         <ToastContainer/>
         <SelectedDeptServe updateDept={updateDept} />
         {
         loading && selectedDept != null ?
         <Loader /> 
         :
         (
            <>
               <h4>Approved Department Requisitions</h4>
               <Accordion defaultActiveKey="0">
                  {data.map ( (item,index) => <DispatchStockAccordionList departmentid={selectedDept} removeItem={removeItem} passToast={passToast} invsettings={invsettings} data={item} key={index} index={index}/>)}
               </Accordion> 
            </>
         )
         }
         {!selectedDept &&
            (<h6 className="alert alert-info mt-2 bg-opacity-50 mx-2">Select a Department to continue</h6>)}
     </InventoryLayout>
   )
}