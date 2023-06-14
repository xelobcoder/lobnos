import React from 'react'

export default function BloodGrouping({ result, testname }) {
  return (
    <div>
      {result.length > 0 && (
        <table className='table mt-5'>
          <thead className='table-dark text-uppercase p-0'>
            <tr>
              <th>testname</th>
              <th>group</th>
              <th>rhesus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Blood Grouping</td>
              <td>{result[0]?.['BGROUP']}</td>
              <td>{result[0]?.['RHESUS']}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}
