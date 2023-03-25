import { DeleteForever, Edit, EditAttributesOutlined } from '@mui/icons-material';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TableDisplay from '../../components/accessories/TableDisplay';
import Inventory_Loading from './loading';
import Header from '../../components/header';
import InventoryHeaders from '../../components/Headers/inventoryHeaders';

export default function INVENTORY_PAGE({ stocks }) {
  const [stocksource, setStocks] = useState(stocks);
  const [search, setSearch] = useState('');
  const STOCKS_URL = 'http://localhost:5000/api/v1/stock';
  const EditUrl = '/inventory/addstock?tab=edit&stockid=';

  const columns = [
    {
      Header: '#',
      Cell: ({ row }) => (
        <div>
          <input type='checkbox' />
        </div>
      ),
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
      Cell: ({ row }) => {
        const alertLevel = row.original.alertlevel >= row.original.quantity ? 'High' : 'Low';
        const alertLevelClass =
          row.original.alertlevel === row.original.quantity ? 'alertlevel-medium' :
            row.original.alertlevel > row.original.quantity ? 'alertlevel-high' : 'alertlevel-low';
        return (
          <div title={`Alert Level: ${alertLevel}`} className={alertLevelClass}>
            {row.original.quantity}
          </div>
        );
      },
    },
    {
      Header: 'Alert Level',
      accessor: 'alertlevel',
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
      Cell: ({ row }) => (
        <div>
          {row.original.date.split('T')[0]}
        </div>
      ),
    },
    {
      Header: 'Action',
      Cell: ({ row }) => (
        <div>
          <DeleteForever
            onClick={() => { handleDelete(row.original.stockid) }}
            fontSize='medium' color='error'
          />
          <Edit fontSize='medium' color='primary' onClick={() => handleEdit(row.original.stockid)} />
        </div>
      ),
    },
  ];

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${STOCKS_URL}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockid: id }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        const newStocks = stocksource.filter((item) => item.stockid !== id);
        setStocks(newStocks);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const router = useRouter();

  const handleEdit = (id) => {
    router.push(`${EditUrl}=${id}`);
  };

  return (
    <>
      <TableDisplay data={stocksource} column={columns} fallback={<Inventory_Loading />} />
    </>
  );
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
          <InventoryHeaders />
        </div>
        <div className="main" id='page-main-view'>{page}</div>
      </div>
    </>
  )
}


// refactor the code above
