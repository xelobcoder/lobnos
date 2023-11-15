import React, { useState, useEffect, useCallback } from 'react'
import SettingsLayout from '../../../../components/settingsComponents/SettingsLayout'
import DepartmentLevelSidebar from '../../../../components/inventory/DepartmentLevelSidebar'
import { useRouter } from 'next/router'
import { Button } from '@mui/material'
import BugReportIcon from '@mui/icons-material/BugReport';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import { customData } from '../../../../components/Auth/customFetch'
import { DeleteForever } from '@mui/icons-material';
import ISLOADING from '../../../../components/isLoading'
import TableDisplay from '../../../../components/accessories/TableDisplay'
import InventoryClass from '../../../../components/Auth/inventory'
import { ProgressBar } from 'react-bootstrap'
export default function ReceiveStocksDepartmentLevel() {
  const departmentId = useRouter().query.id;
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const inventory = new InventoryClass();

  const columns = [
    {
      Header: 'Date Requested',
      accessor: 'date',
      Cell: ({ row }) => <div>{row.original.date.slice(0, 10)}</div>,
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Unit',
      accessor: 'comsumptionunit',
    },
    {
      Header: 'Qty Requested',
      accessor: 'quantity_requested',
    },
    {
      Header: 'brand',
      accessor: 'brand'
    },
    { Header: 'lot number', accessor: 'batchnumber' },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row }) => (
        <div>
          <ProgressBar variant={'success'} title='almost done.90% through' now={90} />
        </div>
      ),
    },
    {
      Header: 'Qty Approved',
      accessor: 'quantity_approved',
      Cell: ({ row }) => (
        <>
          {row.original.quantity_approved == null ? (
            <div className='-lims-text-color'>Not yet</div>
          ) : (
            row.original.quantity_approved
          )}
        </>
      ),
    },
    {
      Header: 'Supplied Qty',
      accessor: 'quantityReceived',
      Cell: ({ row }) => (
        <>
          {
            row.original.status === 'approved' &&
            <input type='number' className='custom-input'
              onChange={(e) => inventory.handleReceiveField(e, row.original.id, stocks)}
              placeholder='Enter quantity supplied' />
          }
        </>
      ),
    },
    {
      Header: 'Action',
      accessor: 'action',
      Cell: ({ row }) => (
        <>
          {
            row.original.status === 'received' ? null : (

              row.original.quantity_approved == null ? (
                <Button variant='contained' color='error' size='small' startIcon={<DeleteForever />}>
                  Delete
                </Button>
              ) : (
                <div>
                  <Button variant='contained' color='success'
                    onClick={(e) => inventory.handleReceivedButton(e, row.original.id, departmentId, setStocks, stocks)}
                    size='small' startIcon={<CallReceivedIcon />}>
                    Received
                  </Button>
                  <Button title='click on report if you are unhappy with the stock  supplied or the stock supplied is less or more than the approved quantity' variant='contained' color='error' size='small' startIcon={<BugReportIcon />}>
                    Report
                  </Button>
                </div>
              )

            )
          }
        </>
      ),
    },
  ];

  const getApprovedStock = useCallback( async () =>  {
    try {customData(`departments/requisitions?id=${departmentId}&&type=approved`, setStocks);setLoading(false);} 
    catch (err) {setStocks([]) }
  },[departmentId])

  useEffect(() => {if (departmentId) {getApprovedStock();}}, [departmentId,getApprovedStock]);


  return (
    <SettingsLayout sidebar={<DepartmentLevelSidebar />}>
      {loading && <ISLOADING />}
      {!loading && <TableDisplay data={stocks} column={columns} />}
    </SettingsLayout>
  )
}
