/* eslint-disable react/jsx-key */
import { DeleteForever, EditAttributesOutlined, EditAttributesTwoTone } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import React, { Suspense } from 'react';
import { useRouter } from 'next/router';
import TableDisplay from '../../components/accessories/TableDisplay';
import Inventory_Loading from './loading';
import Header from '../../components/header';
import InventoryHeaders from '../../components/Headers/inventoryHeaders';

export default function INVENTORY_PAGE({ stocks }) {
  const [stocksource, setStocks] = React.useState(stocks);

  const [search, setSearch] = React.useState('');

  const columns = [
    {
      Header: '#',
      Cell: ({ row }) => <div>
        <input type='checkbox' />
      </div>,
    },
    {
      Header: 'Stock ID',
      accessor: 'stockid',
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Category',
      accessor: 'category',
    },
    {
      Header: 'Consumption Unit',
      accessor: 'consumptionunit',
    },
    {
      Header: 'Purchase Unit',
      accessor: 'purchaseunit',
    },
    {
      Header: 'Quantity',
      accessor: 'quantity',
    },
    {
      Header: 'Alert Level',
      accessor: 'alertlevel',
      Cell: ({ row }) => (
        <div
          className={
            row.original.alertlevel == row.original.quantity
              ? 'alertlevel-medium'
              : row.original.alertlevel > row.original.quantity
                ? 'alertlevel-high' : 'alertlevel-low'
          }
        >
          {row.original.alertlevel}
        </div>
      )
    },
    {
      Header: 'Material Code',
      accessor: 'materialcode',
    },
    {
      Header: 'Tax',
      accessor: 'tax',
    },
    {
      Header: 'Date',
      accessor: 'date',
    },
    {
      Header: 'Action',
      Cell: ({ row }) => (
        <div>
          <DeleteForever
            onClick={() => { handleDelete(row.original.stockid) }}
            fontSize='medium' color='error' />
          <EditIcon fontSize='medium' color='primary'
            onClick={() => handleEdit(row.original.stockid)}
          />
        </div>
      )
    }
  ]


  const handleDelete = (id) => {
    // send delete request to the server
    try {
      fetch(`http://localhost:5000/api/v1/stock`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stockid: id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success') {
            // remove the deleted item from the state
            const newStocks = stocksource.filter((item) => item.stockid !== id);
            setStocks(newStocks);
            console.log(stocksource)
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  const router = useRouter();

  const handleEdit = (id) => {
    router.push(`/inventory/addstock?tab=edit&stockid=${id}`);
  }



  return (
    <>
      <Suspense fallback={<Inventory_Loading />}>
        <TableDisplay data={stocksource} column={columns} />
      </Suspense>
    </>
  )
}

// get server side props
export async function getServerSideProps(context) {
  const response = await fetch('http://localhost:5000/api/v1/stock');
  const data = await response.json();
  const { result, status } = data;
  if (status === 'success') {
    return {
      props: {
        stocks: result,
      },
    };
  }
}




// define a custom page layout 
// Path: components\accessories\Layout.js

INVENTORY_PAGE.getLayout = function getLayout(page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <InventoryHeaders/>
        </div>
        <div className="main">{page}</div>
      </div>
    </>
  )
}