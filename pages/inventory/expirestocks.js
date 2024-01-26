import { useState, useEffect } from 'react'
import TableDisplay from '../../components/accessories/TableDisplay';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import InventoryLayout from '../../components/inventory/InventoryLayout';
import Loader from '../../components/accessories/Loader';
import { ToastContainer, toast } from 'react-toastify';

export default function EXPIRE_STOCKS() {
  const [expireStock, setExpireStock] = useState([]);
  const [loading, setLoading] = useState(true);


  const handleDispose = async (ev, data) => {
    ev.preventDefault();
    const { productordersid, brand, brandid, stockid, Batchnumber } = data;
    const pushData = await customPost('consume/expirestock', 'POST', { productordersid, brand, brandid, stockid, batchnumber: Batchnumber });
    const { status, statusCode, message } = pushData;
    if (statusCode === 200 && status === "success") {
      toast.success(message, { autoClose: 500 });
      const newArray = [...expireStock].filter((item, index) => item?.productordersid != productordersid);
      setExpireStock(newArray);
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
      accessor: 'Batchnumber',
    },
    {
      Header: 'Received Date',
      accessor: 'receiveddate',
      Cell: ({ row }) => (
        <div className='text-success'>
          {new Date(row.original.receiveddate).toLocaleDateString()}
        </div>
      )
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
      Header: 'supplied by',
      accessor: 'suppliername',
    },
    {
      Header: 'Purchase Unit',
      accessor: 'purchaseunit',
    },
    {
      Header: 'action',
      accessor: '',
      Cell:  function ({row}) {
        return <button
          title='this are disposed off as wastage'
          onClick={(ev) => { handleDispose(ev, row.original) }}
          className='btn btn-danger px-1 btn-sm'>dispose</button>
      }
    },
  ]



  const getData = async () => {
    setLoading(true);
    const response = await customFetch(`stock/expirestocks`)
    const { result, status,statusCode } = response;
    if (status === 'success' && statusCode === 200) {
      setExpireStock(result);
      setLoading(false);
    } else {
      setExpireStock([]);
      setLoading(false);
    }
  }

  useEffect(() => {
    try {
      getData();
    } catch (error) {
      setExpireStock([]);
      setLoading(false);
    }
  }, [])

  const handlePrint = async function (ev) {
    window.print()
  }


  const renderer = () => {
    if (loading) return <Loader />
    else return <TableDisplay data={expireStock} column={columns} />
  }

  return (
    <InventoryLayout>
      <ToastContainer />
      <div>
        {/* <div className='d-flex justify-content-end'>
          <button
            onClick={(ev) => { handlePrint(ev) }} className='btn btn-secondary btn-sm mt-1 mx-1'><Print /> print</button>
        </div> */}
        {renderer()}
      </div>
    </InventoryLayout>
  )
}






