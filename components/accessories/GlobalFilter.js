import React from 'react'

export default function GlobalFilter({ filter, setFilter }) {
  return (
    <div>
      <div className='form-group'>
        <div className='d-flex col-3 ' style={{padding:'1px'}}>
          <input type='text' className='custom-input'
            placeholder='search'
            value={filter || ''} onChange={e => setFilter(e.target.value)} />
        </div>
      </div>
    </div>
  )
}
