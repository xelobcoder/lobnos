import React from 'react'
import { useRouter } from 'next/router';
import TableDisplay from '../../components/accessories/TableDisplay';
import Header from "../../components/header";
import InventoryHeaders from "../../components/Headers/inventoryHeaders";
import { Button } from '@mui/material';
import { Backspace, DeleteForever } from '@mui/icons-material';

export default function Requisition() {
  const [hxData, setHxData] = React.useState([]); // [data, setData]
  const router = useRouter();
  const departmentid = router.query.dept;


  React.useEffect(() => {
    if (departmentid) {
      fetch(`http://localhost:5000/api/v1/departments/requisitions?id=${departmentid}`)
        .then((res) => res.json())
        .then((data) => {
          const { status, statusCode } = data;
          if (status === 'success' && statusCode === 200) {
            setHxData(data.data);
          }
        });
    }
  }, [departmentid]);



  const column = [
    {
      Header: 'stockid',
      accessor: 'stockid',
    },
    {
      Header: 'name',
      accessor: 'name',
    },
    {
      Header: 'comsumptionunit',
      accessor: 'comsumptionunit',
    },
    {
      Header: 'quantity_requested',
      accessor: 'quantity_requested',
    },
    {
      Header: 'quantity_approved',
      accessor: 'quantity_approved',
      Cell: ({ row }) => {
        return (
          <>
            {
              row.original.quantity_approved == null ? <div className='-lims-text-color'>Not yet</div> : row.original.quantity_approved
            }
          </>
        )
      }
    },
    {
      Header: 'status',
      accessor: 'status',
      Cell: ({ row }) => {
        return <div>{row.original.status === 'false' ? <div className='text-warning'> Pending</div> : row.original.status}</div>
      }
    },
    {
      Header: 'date_requested',
      accessor: 'date',
      Cell: ({ row }) => {
        return <div>{row.original.date.slice(0, 10)}</div>
      }
    },
    {
      Header: 'action',
      accessor: 'action',
      Cell: ({ row }) => {
        return (
          <>
            <Button startIcon={<DeleteForever />} color='error' variant='contained'>del</Button>
          </>
        )
      }
    },
  ]


  console.log(hxData);

  return (
    <>
      <button className='custom-button mt-2' onClick={() => router.back()}>
        <Backspace sx={{ marginRight: '10px' }} />
        Back
      </button>
      <div>
        <TableDisplay data={hxData} column={column} />
      </div>
    </>
  )
}



Requisition.getLayout = function getLayout(page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <InventoryHeaders />
        </div>
        <div className="main" id="page-main-view">
          {page}
        </div>
      </div>
    </>
  );
};