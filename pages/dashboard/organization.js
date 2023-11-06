import React, { useState } from 'react'
import DashBoardLayoutSales from '../../components/salesSummary/DashBoardLayout'
import TopPerforming from '../../components/salesSummary/topPerforming';
import { handleChangeWithState } from '../../components/Auth/customFetch';

export default function DashBoardOrganization() {
  const [query, setQuery] = useState({ count: 5, chart: false, from: '', to: '' })

  return (
    <DashBoardLayoutSales>
      <h6>Top performing organization</h6>
      <div className='d-flex gap-4'>
        <div className='col-1'>
          <label>show</label>
          <input type='number' onChange={(ev) => { handleChangeWithState(ev, 'count', setQuery, query) }} value={query.count} className='form-control' placeholder='number to show' />
        </div>
        <div className='col-3'>
          <label>Date picker(from)</label>
          <input className='form-control' onChange={(ev) => handleChangeWithState(ev, 'from', setQuery, query)} placeholder='from' type='date' />
        </div>
        <div className='col-3'>
          <label>Date picker(to)</label>
          <input className='form-control' onChange={(ev) => handleChangeWithState(ev, 'to', setQuery, query)} placeholder='to' type='date' />
        </div>
      </div>
      {!query.chart && <TopPerforming category={'organization'} count={query.count} from={query.from} to={query.to} />}
    </DashBoardLayoutSales>
  )
}
