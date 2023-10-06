import React from 'react'

export default function ADD_DEPARTMENT() {
  return (
    <div id='addsupplier' className='addepartment'>
      <form>
        <div className='form-group'>
          <label htmlFor='departmentname'>Department Name</label>
          <input type='text' className='custom-input'
            placeholder='Type department name here ..............'
            id='departmentname' />
        </div>
        <div className='form-group'>
          {/* departmant manger or ion charge */}
          <label htmlFor='departmentmanager'>Department Manager</label>
          <input type='text' className='custom-input'
            placeholder='Type department manager here ..............'
            id='departmentmanager' />
        </div>
        <div className='form-group'>
          {/* butotn */}
          <button type='button' className='btn btn-primary'>
            Add Department
          </button>
        </div>
      </form>
    </div>
  )
}
