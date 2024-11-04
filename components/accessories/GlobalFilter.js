import React from 'react'

export default function GlobalFilter({ filter, setFilter }) {
  return (
    <div className=' p-2'>
      <input type='text' className='col-sm-12 custom-input col-md-6 col-lg-4 col-xl-4'
        placeholder='search'
        value={filter || ''} onChange={e => setFilter(e.target.value)} />
    </div>
  )
}
