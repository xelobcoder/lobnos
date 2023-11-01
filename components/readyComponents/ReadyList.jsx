import TableDisplay from '../accessories/TableDisplay';
import React, { useState } from 'react';
import { EnergySavingsLeaf } from '@mui/icons-material';
import PrintModalReady from './PrintModalReady';

export default function ReadyList({ readydata }) {
  const [active, setActive] = useState(null);
  const [display, setDisplay] = useState(false)

  const hide = (ev) =>  {setDisplay(false)}

  const columns = [
    { Header: 'billingid', accessor: 'billingid' },
    { Header: 'fullname', accessor: 'fullname' }
    ,
    {
      Header: 'status', accessor: 'status', Cell: ({ row }) => {
        const item = row.original;
        return (
          <span
            className={`status ${item.status === 'Ready'
              ? "ready_status"
              : "pending_status"
              }`}
          >
            {item.status}
          </span>
        )
      }
    }
    , {
      Header: 'action', accessor: 'action', Cell: ({ row }) => {
        const item = row.original;
        return (
          <span>
            <button className='btn btn-success btn-sm' onClick={(e) => {
              setDisplay(true)
              setActive(item.billingid)
            }}>
              view
              <EnergySavingsLeaf />
            </button>
          </span>
        )
      }
    }
  ]


  return (
    <>
      {readydata.length > 0 && (
        <TableDisplay filtering={true} column={columns} data={readydata} />
      )}
      <PrintModalReady display={display} active={active} hide={hide} />
    </>
  );
}
