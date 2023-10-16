import React, { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import TableDisplay from '../accessories/TableDisplay';
import SECOND_NO_DATA from '../accessories/secondNodata';
import ConsumeStocKModal from './ConsumeStocKModal';
import { useRouter } from 'next/router';
export default function DepartmentStockLevel({ datasource, deleteStock }) {
  const departmentId = useRouter().query.id;
  const [consume, setConsume] = useState(false);
  const [consumeStock, setConsumeStock] = useState({ departmentid: departmentId, stockid: '', stockname: '', quantityAvailble: '', quantity: '' })

  const pushConsume = async (ev, item) => {
    const { stockid, name, quantityAvailable } = item;
    setConsumeStock({ stockid, departmentid: departmentId, stockname: name, quantityAvailable:quantityAvailable })
    setConsume(true)
  }

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
          <div>
            <button onClick={(ev) => { pushConsume(ev, row.original) }} className='btn btn-sm btn-primary'>
              consume
            </button >
            <button className='btn btn-sm btn-danger mx-1' title='delete stock'
              onClick={(e) => { deleteStock(e, item.stockid); }}>
              <DeleteIcon />
            </button >
          </div>
        )
      }
    }
  ]


  return (
    <>
      {datasource.length === 0 ?
        <SECOND_NO_DATA /> :
        (<TableDisplay data={datasource} column={columns} filtering={true} />)}
      <ConsumeStocKModal show={consume}  data={consumeStock} setShow={setConsume} />
    </>
  )
}
