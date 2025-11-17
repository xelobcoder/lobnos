import React from 'react'

export default function GlobalFilter({ filter, setFilter }) {
     return (
          <div>
               <input type='text' className='form-control  form-control-sm col-md-6 col-lg-4 col-xl-3'
                    style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                    placeholder='search'
                    value={filter || ''} onChange={e => setFilter(e.target.value)} />
          </div>
     )
}
