import React, { useState, useEffect } from 'react'
import TableDisplay from '../../components/accessories/TableDisplay';
import { DeleteForever, EditIcon } from '@mui/icons-material';
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
      Header: 'Action',
      Cell: function (row) {
        return (
          <DeleteForever color='error' onClick={() => handleDelete(row.original.stockid)} />
        )
      }

    }
  ]

  const handleDelete = async (id) => {
    console.log(id);
  }

  const handleEdit = async (id) => {
    console.log(id);
  }


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

  return (
    <InventoryLayout>
      <div>
        <TableDisplay data={expireStock} column={columns} />
      </div>
    </InventoryLayout>
  )
}






