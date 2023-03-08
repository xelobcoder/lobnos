import React from 'react'

export default function TestTable({ testsource }) {
 return (
  <div className='alert rejected-table'>
   {/* create table of test */}
   <table className='table p-0'>
    <thead>
     <tr className='text-uppercase'>
      <th>#</th>
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
