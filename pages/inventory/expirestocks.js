import React, { useState, useEffect } from 'react'
import TableDisplay from '../../components/accessories/TableDisplay';
import { DeleteForever, Print} from '@mui/icons-material';
import { customFetch } from '../../components/Auth/customFetch';
import InventoryLayout from '../../components/inventory/InventoryLayout';

export default function EXPIRE_STOCKS() {
  const [expireStock, setExpireStock] = useState([]);

  const columns = [
    {
      Header: 'Stockid',
      accessor: 'stockid',
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Qty in stock',
      accessor: 'quantity',
    },

    {
      Header: 'Received Date',
      accessor: 'receiveddate',
      Cell: ({ row }) => (
        <div className='text-success'>
          {row.original.receiveddate.split('T')[0]}
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
      Header: 'Batch Number',
      accessor: 'Batchnumber',
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
        console.log(row.original)
        return <button className='btn btn-primary btn-sm'>removed</button>
      }
    },
  ]



  const getData = async () => {
    const response = await customFetch(`stock?expireproduct=true`)
    const { result, status } = response;
    if (status == 'success') {
      setExpireStock(result);
    }
  }

  useEffect(() => {
    try {
      getData();
    } catch (error) {
      console.log(error);
    }
  }, [])

  const handlePrint = async function (ev) {
    console.log(ev.target);
    window.print()
  }

  return (
    <InventoryLayout>
      <div>
        <div className='d-flex justify-content-end'>
        <button onClick={(ev) => {handlePrint(ev)}} className='btn btn-secondary btn-sm mt-1 mx-1'><Print/> print</button>
        </div>
        <TableDisplay data={expireStock} column={columns} />
      </div>
    </InventoryLayout>
  )
}






