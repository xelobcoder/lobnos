import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Alert, Button } from '@mui/material';
import { Backspace, CloseOutlined, DeleteForever } from '@mui/icons-material';
import Header from '../../components/header';
import InventoryHeaders from '../../components/Headers/inventoryHeaders';
import TableDisplay from '../../components/accessories/TableDisplay';
import BugReportIcon from '@mui/icons-material/BugReport';
import ViewCompactAltIcon from '@mui/icons-material/ViewCompactAlt';
import CallReceivedIcon from '@mui/icons-material/CallReceived';

export default function Requisition() {
  const router = useRouter();
  const departmentId = router.query.dept;
  const [hxData, setHxData] = useState([]);
  // state for viewing instructions
  const [instructionView, setInstructionView] = useState(false);

  useEffect(() => {
    async function fetchRequisitions() {
      if (departmentId) {
        try {
          const response = await fetch(`${process.env.BASEURL}/departments/requisitions?id=${departmentId}`);
          const data = await response.json();
          if (data.status === 'success' && data.statusCode === 200) {
            setHxData(data?.data);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    fetchRequisitions();
  }, [departmentId]);

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



  const handleReceivedButton = (e, id) => {
    // filter the hxData using the id
    const filtered = hxData.filter((item) => item.id === id);
    // quantity parsed to integer
    const requested = parseInt(filtered[0].quantity_requested);
    const approved = parseInt(filtered[0].quantity_approved);
    const supplied = parseInt(filtered[0].quantityReceived);
    console.log(supplied, approved, requested);

    if (supplied < approved || supplied > approved) {
      alert('Kindly click on the Report Bug button to report this issue. Read the instructions by clicking on the View Instructions button for more information,Thank you');
    }

    if (supplied === approved) {
      //  send data to the server
      const transformData = {
        id,
        quantityReceived: supplied,
        departmentReceived: 1,
      }

      // send data to the server
      async function sendReceivedData() {
        try {
          const response = await fetch(`${process.env.BASEURL}/departments/requisitions`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformData),
          });
          const data = await response.json();
          if (data.status === 'success' && data.statusCode === 200) {
            alert('Data sent successfully');
            //  udate the state
            const updatedstocks = hxData.filter((item) => item.id !== id);
            setHxData(updatedstocks);
          }
        } catch (error) {
          console.error(error);
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
      Header: 'Quantity Requested',
      accessor: 'quantity_requested',
    },
    {
      Header: 'Quantity Approved',
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
      Header: 'Supplied Quantity',
      accessor: 'quantityReceived',
      Cell: ({ row }) => (
        <>
          <input type='number' className='custom-input'
            onChange={(e) => handleReceiveField(e, row.original.id)}
            placeholder='Enter quantity supplied' />
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
            row.original.quantity_approved == null ? (
              <Button variant='contained' color='error' size='small' startIcon={<DeleteForever />}>
                Delete
              </Button>
            ) : (
              <div>
                <Button variant='contained' color='success'
                  onClick={(e) => handleReceivedButton(e, row.original.id)}
                  size='small' startIcon={<CallReceivedIcon />}>
                  Received
                </Button>
                <Button title='click on report if you are unhappy with the stock  supplied or the stock supplied is less or more than the approved quantity' variant='contained' color='error' size='small' startIcon={<BugReportIcon />}>
                  Report
                </Button>
              </div>
            )
          }
        </>
      ),
    },
  ];

  return (
    <>
      {
        instructionView ? (
          <div id='instruction-view'>
            <div className='content'>
              <Alert severity='info' className='mt-2' sx={{ fontSize: 15 }}>
                <h5 >
                  Instructions
                  <strong>
                    <span className='float-end' onClick={() => setInstructionView(!instructionView)}>
                      <CloseOutlined />
                    </span>
                  </strong>
                </h5>
                <ul>
                  <li className='mb-2'>
                    1. Enter the quantity supplied in the supplied quantity column and click on received button to mark the
                    requisition as received.
                  </li>
                  <li className='mb-2'>
                    2. Incase the quantity supplied is less or more than the approved quantity,<br />Alert enter the quantity supplied in the
                    supplied quantity column and click on report button to report the issue
                  </li>
                  <li className='mb-2'>
                    3. If the delete button is clicked on, a modal will appear to input reason for reporting an issue incase the supplied quantity is equal to the approved quantity
                  </li>
                  <li className='mb-2'>
                    4. Click on the delete button to delete the requisition if it has not been approved
                  </li>
                </ul>
              </Alert>
            </div>
          </div>
        ) : null
      }
      <div className='d-flex'>
        <div>
          <button className='custom-button mt-2' onClick={handleBack}>
            <Backspace sx={{ marginRight: '10px' }} />
            Back
          </button>
        </div>
        <div>
          <button className='custom-button mt-2' onClick={(e) => setInstructionView(!instructionView)}>
            <ViewCompactAltIcon sx={{ marginRight: '10px' }} />
            view instructions</button>
        </div>
      </div>
      <TableDisplay data={hxData} column={columns} />
    </>
  );
}

Requisition.getLayout = function getLayout(page) {
  return (
    <>
      <Header />
      <div className='wrapper'>
        <div className='side'>
          <InventoryHeaders />
        </div>
        <div className='main' id='page-main-view'>
          {page}
        </div>
      </div>
    </>
  );
};
