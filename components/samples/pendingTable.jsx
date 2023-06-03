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
      Cell: ({ row }) => (
        <div>
          <Button onClick={(e) => setShowAction(!showAction)}>
            pull action
          </Button>
          {!showAction ? null : (
            <div>
              <Button
                color="success"
                onClick={(e) => {
                  approvalStatus(row, "accepted");
                  setShowAction(!showAction);
                }}
              >
                accept
              </Button>
              <Button
                color="error"
                onClick={(e) => {
                  approvalStatus(row, "rejected");
                  setShowAction(!showAction);
                }}
              >
                reject
              </Button>
            </div>
          )
          }
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
