import { DeleteForever, Edit, EditAttributesOutlined } from '@mui/icons-material';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TableDisplay from '../../components/accessories/TableDisplay';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import InventoryLayout from '../../components/inventory/InventoryLayout';
import { useEffect } from 'react';
import { Tooltip } from '@mui/material';

export default function INVENTORY_PAGE() {
  const [stocksource, setStocks] = useState([]);
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
        const alertLevelClass = function (value) {
          if (value.alertlevel === value.quantity) {
            return 'alertlevel-medium';
          } else if (value.alertlevel > value.quantity) {
            return 'alertlevel-high'
          } else {
            return 'alertlevel-low'
          }
        }
        return (
          <Tooltip title={`stock alert level is ${alertLevel}`} placement='top'>
            <div className={alertLevelClass(row.original)}>
              {row.original.quantity}
            </div>
          </Tooltip>
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
      Header: 'Action',
      Cell: ({ row }) => (
        <div>
          <Tooltip title='Delete' placement='top'>
            <DeleteForever fontSize='medium' color='error' onClick={() => handleDelete(row.original.stockid)} />
          </Tooltip>
          <Tooltip title='Edit' placement='top'>
            <Edit fontSize='medium' color='primary' onClick={() => handleEdit(row.original.stockid)} />
          </Tooltip>
        </div>
      ),
    },
  ];


  // get the stock data from the database
  const getStocks = async () => {
    const data = await customFetch('stock')
    const { result, status } = data;
    if (status === 'success') {
      setStocks(result);
    }
  };

  useEffect(() => {
    try {
      getStocks();
    } catch (error) {
      console.log(error);
      setStocks([]);
    }
  }, [])


  const handleDelete = async (id) => {
    try {
      const data = await customPost('stock', 'DELETE', { stockid: id })
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
        <TableDisplay data={stocksource} column={columns} filtering={true}  />
      </InventoryLayout>
    </>
  );
}

