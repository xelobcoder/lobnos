import React, { useState, useEffect } from 'react'
import { customFetch, handleChangeWithState } from '../../../../components/Auth/customFetch';
import TableDisplay from '../../../../components/accessories/TableDisplay';
import ImagingSidebar from '../../../../components/ImagingSidebar';
import Header from '../../../../components/header';
import { Print } from '@mui/icons-material';

export default function Ulrtrasoundprocessedlist() {
  const defaultState = { from: '', to: '', search: '' }
  const [query, setQuery] = useState(defaultState);
  const [data, setData] = useState([]);

  const filter = async function () {
    const { from, to, search } = query;
    let endpoint = `operations/imaging/ultrasound/processed?from=${from}&&to=${to}&&search=${search}`;
    let response = await customFetch(endpoint);
    response?.result ? setData(response?.result) : setData([])
  }


  const columns = [
    { Header: 'fullname', accessor: 'fullname' },
    { Header: 'patientid', accessor: 'patientid' },
    { Header: 'billingid', accessor: 'billingid' },
    { Header: 'scan', accessor: 'name' },
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
        const { fullname, name, billingid, testid, patientid } = source;
        const link = `./result?billingid=${billingid}&&scan=${name}&&testid=${testid}&&fullname=${fullname}&&patientid=${patientid}`
        return (
          <div>
            <button className='btn btn-primary  btn-sm'
              onClick={(ev) => window.open(link)}>
              edit
            </button>
            <button className='btn btn-secondary mx-1  btn-sm' >
              Print <Print/>
            </button>
          </div>
        )
      }
    }
  ]



  useEffect(() => { filter() }, [])

  return (
    <>
      <Header />
      <ImagingSidebar />
      <div className='mx-2'>
          <div className='card br-5'>
            <div className='card-header bg-secondary text-white'>
              <h5>Filter Processed List</h5>
            </div>
            <div className='card-body'>
              <section className='d-flex justify-content-between'>
                <div className='col-3'>
                  <label>from</label>
                <input type='date' value={query.from} onChange={(ev) => { handleChangeWithState(ev, 'from', setQuery, query) }} className='custom-input' placeholder='date' />
                </div>
                <div className='col-3'>
                  <label>to</label>
                <input type='date' onChange={(ev) => { handleChangeWithState(ev, 'to', setQuery, query) }} value={query.to} className='custom-input' placeholder='date' />
                </div>
                <div className='col-3'>
                  <label>search using fullname </label>
                <input type='text' onChange={(ev) => { handleChangeWithState(ev, 'search', setQuery, query) }} className='custom-input' value={query.search} placeholder='search using fullname' />
                </div>
              <div className='col-2 mt-3'>
                <button onClick={filter} className='btn btn-primary btn-sm mt-1'>search</button>
                <button onClick={(ev) => setQuery(defaultState)} className='btn btn-danger  btn-sm mt-1 mx-1'>clear</button>
                </div>
              </section>
            </div>
          </div>
          <h4 className='mt-2 text-success'>Processed List</h4>
        <TableDisplay filtering={true} column={columns} data={data} />
      </div>
    </>
  )
}
