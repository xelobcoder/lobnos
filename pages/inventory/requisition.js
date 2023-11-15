import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {Button } from '@mui/material';
import { DeleteForever } from '@mui/icons-material';
import TableDisplay from '../../components/accessories/TableDisplay';
import BugReportIcon from '@mui/icons-material/BugReport';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import { CheckCircle } from '@mui/icons-material';
import {fetchRequisitionsByIdAndCategory, customPost } from '../../components/Auth/customFetch';

export default function Requisition() {
  const router = useRouter();
  const departmentId = router.query.dept;
  const [hxData, setHxData] = useState([]);
  // state for viewing instructions
  const [instructionView, setInstructionView] = useState(false);
  const [dataCategory, setDataCategory] = useState('approved');

  const fetchRequisitions = useCallback(async () => {fetchRequisitionsByIdAndCategory(departmentId,dataCategory,setHxData)}
  ,[departmentId,dataCategory])

  useEffect(() => {fetchRequisitions();}, [departmentId, dataCategory,fetchRequisitions]);

  const handleBack = () => {
    router.back();
  };


  // handle qty receive at the department level

  const handleReceiveField = (e, id) => {
    const { value } = e.target;
    // update the input field with the value
    // filter the hxData using the id
    const filtered = hxData.filter((item) => item.id === id);
    // quantity parsed to integer
    if (filtered.length > 0) {
      filtered[0].quantityReceived = value;
    }
  }



  const handleReceivedButton = (e, id, departmentid) => {
    // filter the hxData using the id
    const filtered = hxData.filter((item) => item.id === id);
    // quantity parsed to integer
    const requested = parseInt(filtered[0].quantity_requested);
    const approved = parseInt(filtered[0].quantity_approved);
    const supplied = parseInt(filtered[0].quantityReceived);


    if (supplied < approved || supplied > approved) {
      alert('Kindly click on the Report Bug button to report this issue. Read the instructions by clicking on the View Instructions button for more information,Thank you');
    }

    if (supplied === approved) {
      //  send data to the server
      const transformData = {
        id,
        quantityReceived: supplied,
        departmentReceived: 1,
        status: 'received',
        stockid: filtered[0].stockid,
        departmentid: parseInt(departmentid),
        consumptionunit: filtered[0].comsumptionunit,
      }

      // send data to the server
      async function sendReceivedData() {
        try {
          const data = await customPost('departments/requisitions', 'PUT', transformData)
          if (data.status === 'success' && data.statusCode === 200) {
            alert(data.message);
            //  udate the state
            const updatedstocks = hxData.filter((item) => item.id !== id);
            setHxData(updatedstocks);
          }

          if (data.status === 'error') {
            alert(data.message);
          }
        } catch (error) {
          setHxData([])
        }
      }
      sendReceivedData();
    }
  }

  const columns = [
    {
      Header: 'Stock ID',
      accessor: 'stockid',
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Consumption Unit',
      accessor: 'comsumptionunit',
    },
    {
      Header: 'Qty Requested',
      accessor: 'quantity_requested',
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
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row }) => (
        <div>{row.original.status === 'false' ? <div className='text-warning'> Pending</div> : row.original.status}</div>
      ),
    },
    {
      Header: 'Supplied Qty',
      accessor: 'quantityReceived',
      Cell: ({ row }) => (
        <>
          {row.original.status === 'received' && <div className='text-success'><CheckCircle /></div>
          }
          {
            row.original.status === 'pending' &&
            <input type='number' className='custom-input'
              onChange={(e) => handleReceiveField(e, row.original.id)}
              placeholder='Enter quantity supplied' disabled />
          }
          {
            row.original.status === 'approved' &&
            <input type='number' className='custom-input'
              onChange={(e) => handleReceiveField(e, row.original.id)}
              placeholder='Enter quantity supplied' />
          }
        </>
      ),
    },
    {
      Header: 'Date Requested',
      accessor: 'date',
      Cell: ({ row }) => <div>{row.original.date.slice(0, 10)}</div>,
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
                    onClick={(e) => handleReceivedButton(e, row.original.id, row.original.departmentid)}
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

  return (
    <>
      <TableDisplay data={hxData} column={columns} />
    </>
  );
}
