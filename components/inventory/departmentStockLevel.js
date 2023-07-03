import React from 'react'
import SECOND_NO_DATA from '../accessories/secondNodata';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import TableDisplay from '../accessories/TableDisplay';
export default function DepartmentStockLevel({ datasource, deleteStock }) {
  const router = useRouter();

  const columns = [
    { Header: 'stockid', accessor: 'stockid' },
    { Header: 'name', accessor: 'name' },
    { Header: 'category', accessor: 'category' },
    { Header: 'consumption unit', accessor: 'consumptionunit' },
    { Header: 'qty Available', accessor: 'quantityAvailable' },
    {
      Header: 'Action',
      Cell: function ({ row }) {

        return (
          <Button variant='contained'
            size='small'
            onClick={(e) => {
              deleteStock(e, item.stockid);
            }}
            color='error' startIcon={<DeleteIcon />}>Delete</Button>
        )
      }
    }
  ]

  return (
    <>
      <TableDisplay data={datasource} column={columns} filtering={true} />
    </>
  )
}
