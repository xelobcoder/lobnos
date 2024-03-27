import  { useState } from 'react'
import DashBoardLayoutSales from '../../../components/salesSummary/DashBoardLayout'
import TopPerforming from '../../../components/salesSummary/topPerforming';
import { handleChangeWithState } from '../../../components/Auth/customFetch';

export default function DashBoardOrganization() {
  const [query, setQuery] = useState({ count: 5, chart: false, from: '', to: '' })

  return (
    <DashBoardLayoutSales>
      <div className='d-flex gap-4 bg-white br-5 px-2 py-2 my-2 border border-light pointer'>
        <div className='col-1'>
          <label>show</label>
          <input type='number' onChange={(ev) => { handleChangeWithState(ev, 'count', setQuery, query) }} value={query.count} className='custom-input' placeholder='number to show' />
        </div>
        <div className='col-3'>
          <label>Date picker(from)</label>
          <input className='custom-input' onChange={(ev) => handleChangeWithState(ev, 'from', setQuery, query)} placeholder='from' type='date' />
        </div>
        <div className='col-3'>
          <label>Date picker(to)</label>
          <input className='custom-input' onChange={(ev) => handleChangeWithState(ev, 'to', setQuery, query)} placeholder='to' type='date' />
        </div>
      </div>
      <h6>Top performing organization</h6>
      {!query.chart && <TopPerforming category={'organization'} count={query.count} from={query.from} to={query.to} />}
    </DashBoardLayoutSales>
  )
}
