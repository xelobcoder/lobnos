import { DeleteForever, Edit, EditAttributesOutlined } from '@mui/icons-material';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TableDisplay from '../../components/accessories/TableDisplay';
import Inventory_Loading from './loading';
import Header from '../../components/header';
import InventoryHeaders from '../../components/Headers/inventoryHeaders';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import InventoryLayout from '../../components/inventory/InventoryLayout';

export default function INVENTORY_PAGE({ stocks }) {
  const [stocksource, setStocks] = useState(stocks);
  const [search, setSearch] = useState('');
  const STOCKS_URL = `${process.env.BASEURL}/stock`;
  const EditUrl = '/inventory/addstock?tab=edit&stockid';

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
      Header: 'Date',
      accessor: 'date',
      Cell: ({ row }) => (
        <div>
          {row.original.date.split('T')[0]}
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
      const data = await customPost('stock','DELETE',{stockid:id})
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
      <InventoryLayout>
        <TableDisplay data={stocksource} column={columns} filtering={true} styling={'custom-table'} />
      </InventoryLayout>
    </>
  );
}


// get server side props
export async function getServerSideProps(context) {
  const data = await customFetch('stock')
  const { result, status } = data;
  if (status === 'success') {
    return {
      props: {
        stocks: result,
      },
    };
  }
}



