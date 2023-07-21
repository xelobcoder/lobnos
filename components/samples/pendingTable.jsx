import React, { useState } from 'react'
import { Button, Typography } from '@mui/material';
import TableDisplay from '../accessories/TableDisplay';
import Accord from '../accessories/Accord';

export default function PendingTableSample({ data, approvalStatus }) {
  const [showAction, setShowAction] = useState(false);
  const columns = [
    {
      Header: "DATE",
      accessor: "DATE",
      Cell: ({ row }) => {
        return <span>{row.original.DATE.slice(0, 10)}</span>;
      },
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
      Cell: ({ row }) => (
        <Button
          size="small"
          className={
            row.original.SAMPLE_STATUS == "PENDING"
              ? "text-warning"
              : row.original.SAMPLE_STATUS == "ACCEPTED"
                ? "text-success"
                : "text-danger"
          }
        >
          {row.original.SAMPLE_STATUS}
        </Button>
      ),
    },
    {
      Header: "ACTION",
      accessor: "ACTION",
      Cell: ({ row }, params) => (
        <div style={{ display: "flex", justifyContent: "left" }}>
          <Button
            variant="outlined"
            size='small'
            color="success"
            onClick={() => {
              approvalStatus(row.original, "accepted");
            }}
          >
            accept
          </Button>
          <Button
            variant="outlined"
            size='small'
            color="error"
            sx={{ marginLeft: "20px" }}
            onClick={(e) => {
              approvalStatus(row.original, "rejected");
            }}
          >
            reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className='alert alert-info'>
        <span className='text-danger'>Note:</span> Please check the sample list before accepting or rejecting the sample
      </div>

      {/* <TableDisplay data={data} column={columns} filtering={true} /> */}
      {/* using mui accoridon */}
      <diov className='list-group'>
        {data.map((item, index) => {
          return (
            <Accord key={index} data={item} />
          )
        })}
      </diov>
    </div>
  )
}
