import React, { useState } from 'react'
import { Button } from '@mui/material';
import TableDisplay from '../accessories/TableDisplay';

export default function PendingTableSample({ data, approvalStatus }) {
  const [showAction, setShowAction] = useState(false);
  const columns = [
    {
      Header: "DATE",
      accessor: "DATE",
      Cell: ({ row }) => {
        return (<span>{row.original.DATE.slice(0, 10)}</span>)
      }
    },
    {
      Header: "BILLINGID",
      accessor: "BILLINGID",
    },
    {
      Header: "FULLNAME",
      accessor: "FULLNAME",
    },
    {
      Header: "STATUS",
      accessor: "SAMPLE_STATUS",
      Cell: ({ row }) => (<Button
        className={row.original.SAMPLE_STATUS == 'PENDING' ? 'text-warning' : row.original.SAMPLE_STATUS == 'ACCEPTED' ? 'text-success' : 'text-danger'}
      >{row.original.SAMPLE_STATUS}</Button>),
    },
    {
      Header: "ACTION",
      accessor: "ACTION",
      Cell: ({ row },params) => (
        <div style={{display:'flex',justifyContent:'center'}}>
          <Button
            variant='outlined'
            color="success"
            onClick={() => {
              approvalStatus(row.original, "accepted");
            }}
          >
            accept
          </Button>
          <Button
            variant='outlined'
            color="error"
            sx={{marginLeft:'20px'}}
            onClick={(e) => {
              approvalStatus(row.original, "rejected");
            }}
          >
            reject
          </Button>
        </div>
      )
    },
  ];
  return (
    <div>
      <TableDisplay data={data} column={columns} filtering={true} />
    </div>
  )
}
