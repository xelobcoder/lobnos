import React, { useState } from 'react'
import { customFetch, handleChangeWithState } from '../../../../components/Auth/customFetch';

export default function Ulrtrasoundprocessedlist() {
  const [query, setQuery] = useState({ from: '', to: '', search: '' });

  const filter = async function () {
    const { from, to, search } = query;
    let endpoint = `operations/imaging/ultrasound?from=${from}&&to=${to}&&search=${search}`;
    let response = await customFetch(endpoint);
    console.log(response)
  }

  return (
    <div className='container-fluid'>
      <div className='container'>
        <div className='row'>
          <div className='col'>
            <h5>Filter Processed List</h5>
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
                <label>search using fullname or clientid </label>
                <input type='text' onChange={(ev) => { handleChangeWithState(ev, 'search', setQuery, query) }} className='form-control' value={query.search} placeholder='search using fullname or clientid' />
              </div>
              <div className='col-2'>
                <button onClick={filter} className='btn btn-primary mt-4 '>search</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
