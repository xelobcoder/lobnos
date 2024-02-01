import { useCallback, useEffect, useState } from "react";
import DepartmentInventoryLayout from "../../../../components/inventory/departments/DepartmentInventoryLayout";
import Loader from "../../../../components/accessories/Loader";
import TableDisplay from "../../../../components/accessories/TableDisplay";
import { useRouter } from "next/router";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import { ToastContainer, toast } from "react-toastify";

export default function DepartmentExpiredStocks() {
   const [isloading, setisLoading] = useState(true);
   const departmentid = useRouter().query.id;
   const [stocks, setStocks] = useState([]);

   const getData = useCallback(async () => {
      setisLoading(true);
      const response = await customFetch(`inventory/departments/expiredproducts?departmentid=${departmentid}`)
      const { result, status } = response;
      if (status === 'success') {
         setStocks(result);
         setisLoading(false);
      } else {
         setStocks([]);
         setisLoading(false);
      }
   }, [departmentid])

   useEffect(() => {
      getData();
   }, [getData])

   const handleDispose = async (ev, data) => {
      ev.preventDefault();
      const pushData = await customPost('inventory/consume/department/expirestock', 'POST', { ...data, departmentid });
      const { status, statusCode, message } = pushData;
      if (statusCode === 200 && status === "success") {
         toast.success(message, { autoClose: 500 });
         const newArray = [...stocks].filter((item, index) =>
            !(item?.stockid == stockid &&
               batchnumber == item?.batchnumber && brandid == item?.brandid));
         setStocks(newArray);
      } else {
         toast.error(message, { autoClose: 3000 });
      }
   }

   const columns = [
      {
         Header: 'Name',
         accessor: 'name',
      },
      {
         Header: 'Brand',
         accessor: 'brand',
      },
      {
         Header: 'Batch Number',
         accessor: 'batchnumber',
      },
      {
         Header: 'Expiry Date',
         accessor: 'expirydate',
         Cell: ({ row }) => (
            <div className='text-danger'>
               {row.original.expirydate.split('T')[0]}
            </div>
         )
      },
      {
         Header: 'qty in stock',
         accessor: 'qtyAvailable',
      },
      {
         Header: 'action',
         accessor: '',
         Cell: function ({ row }) {
            return <button
               title='this are disposed off as wastage'
               onClick={(ev) => { handleDispose(ev, row.original) }}
               className='btn btn-danger px-1 btn-sm'>dispose</button>
         }
      },
   ]

   const renderer = () => {
      if (isloading) return <Loader />
      else return <TableDisplay column={columns} data={stocks} />
   }
   return (
      <DepartmentInventoryLayout>
         <ToastContainer />
         <h1>Department Expired Stocks</h1>
         {renderer()}
      </DepartmentInventoryLayout>
   )
}