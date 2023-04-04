import React from 'react'

export default function TestTable({ testsource }) {
 return (
  <div className='p-2'>
   {/* create table of test */}
   <table id='custom-table'>
    <thead>
     <tr className='text-uppercase'>
      <th style={{width:'20px'}}>#</th>
      <th>test</th>
     </tr>
    </thead>
    <tbody>
     {
      testsource.length === 0 ? null : (
       testsource.map((item, index) => {
        return (
         <tr key={index}>
          <td>{index + 1}</td>
          <td>{item}</td>
         </tr>)
       })
      )
     }
    </tbody>
   </table>
  </div>
 )
}
