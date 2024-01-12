import { Assignment, DeleteForever, Edit } from '@mui/icons-material';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TableDisplay from '../../components/accessories/TableDisplay';
import {  customPost } from '../../components/Auth/customFetch';
import InventoryLayout from '../../components/inventory/InventoryLayout';
import { useEffect } from 'react';
import { Tooltip } from '@mui/material';
import { getStocks, getWareHouseList, handleAssignWare } from '../../components/inventory/Util';
import ADD_STOCK_INVENTORY from '../../components/inventory/addstock';

export default function INVENTORY_PAGE() {
  const [editing, setEditing] = useState({ edit: false, stockid: null,data: {} });
  const [stocksource, setStocks] = useState([]);
  const [warehouseList, setWareHouseList] = useState([]);
  const EditUrl = '/inventory/addstock?tab=edit&stockid';
  const [showModal, setShowmodal] = useState(false);

  const columns = [
    // {
    //   Header: '#',
    //   Cell: ({ row }) => (
    //     <div>
    //       <input type='checkbox' />
    //     </div>
    //   ),
    // },
    {
      Header: 'Date',
      accessor: 'date',
      Cell: ({ row }) => (
        <div>
          {new Date(row.original.date).toLocaleDateString()}
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
      Header: 'Consump Unit',
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
        const alertLevelClass = (value) => {
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
            <Edit fontSize='medium' color='primary' onClick={() => handleEditingStock(row.original.stockid,row.original)} />
          </Tooltip>
          <Tooltip title="Reassign warehouse and shelf" onClick={() =>  {handleAssignWare(row.original)}}>
            <Assignment fontSize='medium' primary='success' />
          </Tooltip>
        </div>
      ),
    },
  ];



  useEffect(() => {
    getStocks('all', setStocks);
    getWareHouseList(setWareHouseList);
  }, []);


  const closeModal = (reload) => {
    setShowmodal(false);
    setEditing({ edit: false, stockid: null });
  }
  const show = () => setShowmodal(true);
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

  const handleEditingStock = (id,data) => {
    if (!id) return;
    setEditing({ edit: true, stockid: id ,data});
    setShowmodal(true);
  };

  return (
    <>
      <InventoryLayout>
        <div className='d-flex justify-content-end'>
        <select className='custom-select col-3 mx-2'>
            <option>select a warehouse</option>
            <option value='all'>all warehouse</option>
            {
              warehouseList.map((item, index) => {
                return (
                  <option key={index}>{item?.name}</option>
                )
              })
            }
          </select>
          <button  className='btn btn-primary btn-sm mx-2'>
          New stock Category
          </button>
          <button onClick={show} className='btn btn-primary btn-sm'>
              New stock
          </button>
          
        </div>
          <div  style={{marginTop:'-40px'}}>
          <TableDisplay data={stocksource} column={columns} filtering={true}  />
        </div>
        <ADD_STOCK_INVENTORY warehouseList={warehouseList} editing={editing} show={showModal} closeModal={closeModal}/>
      </InventoryLayout>
    </>
  );
}

