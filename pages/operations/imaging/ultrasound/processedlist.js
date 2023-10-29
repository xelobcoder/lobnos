import React, { useState, useEffect } from 'react'
import { customFetch, handleChangeWithState } from '../../../../components/Auth/customFetch';
import { Button } from '@mui/material';
import TableDisplay from '../../../../components/accessories/TableDisplay';
import { Edit, PrintRounded } from '@mui/icons-material';
import { useRouter } from 'next/router';
import ImagingSidebar from '../../../../components/ImagingSidebar';

export default function Ulrtrasoundprocessedlist() {
  const defaultState = { from: '', to: '', search: '' }
  const [query, setQuery] = useState(defaultState);
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
        return (<span className='text-success'>
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
            <button className='btn btn-primary  btn-sm'
              onClick={(ev) => router.push(link)}>
              <Edit />  edit
            </button>
            <button className='btn btn-secondary mx-1  btn-sm' >
              <PrintRounded /> print
            </button>
          </div>
        )
      }
    }
  ]



  useEffect(() => { filter() }, [])

  return (
    <>
      <div className='container-fluid'>
        <div>
          <ImagingSidebar/>
          <div className='card br-5'>
            <div className='card-header bg-secondary text-white'>
              <h5>Filter Processed List</h5>
            </div>
            <div className='card-body'>
              <section className='d-flex justify-content-between'>
                <div className='col-3'>
                  <label>from</label>
                  <input type='date' value={query.from} onChange={(ev) => { handleChangeWithState(ev, 'from', setQuery, query) }} className='form-control' placeholder='date' />
                </div>
                <div className='col-3'>
                  <label>to</label>
                  <input type='date' onChange={(ev) => { handleChangeWithState(ev, 'to', setQuery, query) }} value={query.to} className='form-control' placeholder='date' />
                </div>
                <div className='col-3'>
                  <label>search using fullname </label>
                  <input type='text' onChange={(ev) => { handleChangeWithState(ev, 'search', setQuery, query) }} className='form-control' value={query.search} placeholder='search using fullname' />
                </div>
                <div className='col-2 mt-2'>
                  <button onClick={filter} className='btn btn-primary mt-4 '>search</button>
                  <button  onClick={(ev) => setQuery(defaultState)}className='btn btn-danger mt-4 mx-1'>clear</button>
                </div>
              </section>
            </div>
          </div>
          <h4 className='mt-2 text-success'>Processed List</h4>
          <TableDisplay styling={'excel-table'} filtering={true} column={columns} data={data} />
        </div>
      </div>
    </>
  )
}
