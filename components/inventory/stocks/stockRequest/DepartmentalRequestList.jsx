import { useEffect, useState } from "react"
import Loader from "../../../accessories/Loader";
import { customFetch,customPost } from "../../../Auth/customFetch";
import TableDisplay from "../../../accessories/TableDisplay";
import { ToastContainer,toast } from 'react-toastify';

export default function DepartmentalStockRequestServing({departmentid}) {
   const [isloading, setIsLoading] = useState(true);
   const [requisitions, setRequisitions] = useState([]);


   const getRequisitionData = function (departmentid) {
      setIsLoading(true);
      customFetch(`store/departments/requisitions?id=${departmentid}&&type=pending`)
         .then((data) => {
            setRequisitions(data?.result || []);
            setIsLoading(false);
         })
         .catch((err) => setIsLoading(false))
    }

   useEffect(() => {
      departmentid && getRequisitionData(departmentid);
   }, [departmentid]);

   const handleQuantity = (ev, item) => {
      ev.preventDefault();
      let value = ev.target.value;
      value = parseInt(value);
      const index = requisitions.findIndex((a, b) => a.id === parseInt(item?.id));
      requisitions[index]['quantity_approved'] = value;
   }

   const handleSupply = async (ev, item) => {
      const { quantity ,quantity_requested,quantity_approved,id} = item;
      const index = requisitions.findIndex((a, b) => a.id === parseInt(id));
      console.log(quantity, index, quantity_requested, quantity_approved);
      if (quantity_approved > quantity || quantity_approved < 0) {
         requisitions[index]['quantity_approved'] = quantity_requested;
         toast.warning('quantity should not be less than 0 and not greater than quantity qty available in store', { autoClose: 3000 });
      } else {
         const data = { quantity:quantity_approved,status: "approved", requisitionid:id };
         const response = await customPost(`departments/requisitions/stage1`, 'PATCH', data);
         if (response?.status === 'success') {
            toast.success("requisition updated successfully", { autoClose: 1000 });
            const newArray = requisitions.filter((item, index) => item.id != id);
            setRequisitions(newArray);
         } else {
            toast.error("approval failed", { autoClose: 2000 });
         }
      }
   }
   
 

   const columns = [
      { Header: "Name", accessor: "name"},
      { Header: "Store qty", accessor: "quantity"},
      { Header: "Quantity Requested", accessor: "quantity_requested" },
      {Header: 'qty', accessor: 'quantity_approved',
         Cell: ({row}) => { return <input className="custom-input" value={row.original.quantity_approved}  type="number" onChange={(ev) => handleQuantity(ev,row.original)} /> }},
      {
         Header: 'Action', accessor: '',
         Cell: ({row}) => {
            return <button
               onClick={(ev) =>  {handleSupply(ev,row.original)}}
               className="btn btn-primary btn-sm">supply</button>
         }
      },
   ]

   return (
      <>
         <ToastContainer/>
         {isloading ?
            <Loader /> 
            :
            <TableDisplay filtering={true} styling={'flair-table'} column={columns} data={requisitions} />
         }
      </>
   )
}