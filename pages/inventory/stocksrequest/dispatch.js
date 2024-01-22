import { useEffect, useState } from "react";
import InventoryLayout from "../../../components/inventory/InventoryLayout";
import { Accordion } from 'react-bootstrap';
import { customFetch } from "../../../components/Auth/customFetch";
import Loader from "../../../components/accessories/Loader";
import DispatchStockAccordionList from "../../../components/inventory/stocks/stockRequest/_DispatchStockAccordionList";
import { getInvSettings, inventorySettings } from "../../../components/inventory/Util";
export default function DispathApprovedStockToDepart() {
   const [data, setData] = useState([]);
   const [invsettings, setInvsettings] = useState(inventorySettings);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      setLoading(true);
      customFetch(`store/departments/requisitions/serve?departmentid=${8}`)
         .then((data) => { 
            const { statusCode, status, result } = data;
            statusCode === 200 && status === "success" && setData(result);
            setLoading(false);
         })
         .catch((err) => setLoading(false));
      getInvSettings(setInvsettings)
   },[])
   return (
      <InventoryLayout>
       {  loading ?
         <Loader /> 
         :
         (
            <>
               <h4>Approved Department Requisitions</h4>
               <Accordion defaultActiveKey="0">
                  {data.map ( (item,index) => <DispatchStockAccordionList invsettings={invsettings} data={item} key={index} index={index}/>)}
               </Accordion> 
            </>
         )
         }
     </InventoryLayout>
   )
}