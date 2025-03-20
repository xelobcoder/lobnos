import React, { useState, useEffect } from 'react'

export default function SortList({filterhandle,sorthandle,sortdefault}) {
 return (
  <>
   <div className='d-flex mt-3'>
    <div className='d-flex col-4'>
     <label className='col-3'>filter row : </label>
     <input className='form-control ' onChange={(e) => filterhandle(e)}/>
    </div>
    <div className='d-flex col-4'>
     <label className='col-3'>
      sort by ID
     </label>
     <select className='form-control' value={sortdefault} onChange={(e) => sorthandle(e)}>
      <option value='ID ASC'>ID ASC</option>
      <option value='ID DESC'>ID DESC</option>
     </select>
    </div>
   </div>
  </>
 )
}
