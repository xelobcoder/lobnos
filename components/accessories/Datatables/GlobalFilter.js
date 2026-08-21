import React from 'react'

export default function GlobalFilter({ filter, setFilter }) {
     return (
          <div>
               <input type='search' className='form-control form-control-sm'
                    style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                    placeholder='Search table'
                    aria-label='Search table'
                    value={filter || ''} onChange={e => setFilter(e.target.value)} />
          </div>
     )
}
