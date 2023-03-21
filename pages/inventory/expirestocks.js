import React, { Suspense } from 'react'
import TableDisplay from '../../components/accessories/TableDisplay';
import Header from '../../components/header';
import InventoryHeaders from '../../components/Headers/inventoryHeaders';
import { DeleteForever, EditIcon } from '@mui/icons-material';
import ADD_DEPARTMENT from '../../components/inventory/addDepartment';

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
      Header: 'Expiry Date',
      accessor: 'expirydate',
    },
    {
      Header: 'Received Date',
      accessor: 'receiveddate',
      Cell : ({row}) => (
        <div>
          {row.original.receiveddate.split('T')[0]}
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
         <DeleteForever color='error' onClick={() => handleDelete(row.original.productsorderid)} />
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
      <Suspense fallback={<div>loading ...........</div>}>
        <TableDisplay data={expirestock} column={columns} />
      </Suspense>
    </div>
  )
}






// get server side props
export async function getServerSideProps(context) {
  const getdb_data = await fetch(`http://localhost:5000/api/v1/stock?expireproduct=true`);
  const result = await getdb_data.json();
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
