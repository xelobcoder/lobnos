import React, { useState, useEffect } from 'react'
import { customFetch, handleChangeWithState } from '../../../../components/Auth/customFetch';
import { Button } from '@mui/material';
import TableDisplay from '../../../../components/accessories/TableDisplay';
import { Edit, PrintRounded } from '@mui/icons-material';
import { useRouter } from 'next/router';

export default function Ulrtrasoundprocessedlist() {
  const [query, setQuery] = useState({ from: '', to: '', search: '' });
  const [data, setData] = useState([]);
  const router = useRouter();

  const filter = async function () {
    const { from, to, search } = query;
    let endpoint = `operations/imaging/ultrasound/processed?from=${from}&&to=${to}&&search=${search}`;
    let response = await customFetch(endpoint);
    response?.result ? setData(response?.result) : setData([])
  }


  const columns = [
    { Header: 'fullname', accessor: 'FULLNAME' },
    { Header: 'patientid', accessor: 'PATIENTID' },
    { Header: 'billingid', accessor: 'BILLINGID' },
    { Header: 'scan', accessor: 'NAME' },
    {
      Header: 'status', accessor: 'ready', Cell: function ({ row }) {
        const status = row.original.ready === 'true' ? 'completed' : 'pending';
        return (<span className='bg-success rounded' style={{ padding: '2px 10px', color: 'white' }}>
          {status}
        </span>)
      }
    },
    {
      Header: 'entry', Cell: function ({ row }) {
        const source = row.original;
        const { FULLNAME, NAME, BILLINGID, TESTID, PATIENTID } = source;
        const link = `./result/${BILLINGID}?scan=${NAME}&&testid=${TESTID}&&fullname=${FULLNAME}&&patientid=${PATIENTID}`
        return (
          <div>
            <Button variant='contained' size='small'
              onClick={(ev) => router.push(link)}>
              <Edit />  edit result
            </Button>
            <Button variant='contained' color='warning' sx={{ ml: 2 }} size='small'>
              <PrintRounded /> print result
            </Button>
          </div>
        )
      }
    }
  ]



  useEffect(() => { filter() }, [])

  return (
    <div className='container-fluid'>
      <div className='container'>
        <div className='row d-block'>
          <div className='col'>
            <h5>Filter Processed List</h5>
            <section className='d-flex justify-content-between bg-warning p-3 br-5'>
              <div className='col-3'>
                <label>from</label>
                <input type='date' value={query.from} onChange={(ev) => { handleChangeWithState(ev, 'from', setQuery, query) }} className='form-control' placeholder='date' />
              </div>
              <div className='col-3'>
                <label>to</label>
                <input type='date' onChange={(ev) => { handleChangeWithState(ev, 'to', setQuery, query) }} value={query.to} className='form-control' placeholder='date' />
              </div>
              <div className='col-3'>
                <label>search using firstname, lastname, middlename or clientid</label>
                <input type='text' onChange={(ev) => { handleChangeWithState(ev, 'search', setQuery, query) }} className='form-control' value={query.search} placeholder='search using firstname, lastname, middlename or clientid' />
              </div>
              <div className='col-2'>
                <button onClick={filter} className='btn btn-primary mt-4 '>search</button>
              </div>
            </section>
          </div>
          <div className='col'>
            <TableDisplay styling={'excel-table'} filtering={true} column={columns} data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
