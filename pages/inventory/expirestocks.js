import React, { Suspense } from 'react'
import TableDisplay from '../../components/accessories/TableDisplay';
import Header from '../../components/header';
import InventoryHeaders from '../../components/Headers/inventoryHeaders';
import { DeleteForever, EditIcon } from '@mui/icons-material';
import ADD_DEPARTMENT from '../../components/inventory/addDepartment';
import { customFetch } from '../../components/Auth/customFetch';

export default function EXPIRE_STOCKS({ expirestock }) {
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
      Header: 'Quantity',
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

  return (
    <div>
        <TableDisplay data={expirestock} column={columns} />
    </div>
  )
}






// get server side props
export async function getServerSideProps(context) {
  const result = await customFetch(`stock?expireproduct=true`)
  const { data, status } = result;
  if (status === 'success') {
    return {
      props: {
        expirestock: data,
      },
    };
  }
}

EXPIRE_STOCKS.getLayout = function getLayout(page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <InventoryHeaders />
        </div>
        <div className="main" id='page-main-view'>{page}</div>
      </div>
    </>
  )
}
