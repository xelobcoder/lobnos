import React from 'react'

export default function ColumnFilter({column}) {
  const { filterValue, setFilter } = column
  return (
    <div>
      <div className='form-group'>
        <div className='d-flex col-3 ' style={{ padding: '10px' }}>
          <input type='text' className='custom-input'
            placeholder='search'
            value={filter || ''} onChange={e => setFilter(e.target.value)} />
        </div>
      </div>
    </div>
  )
}
