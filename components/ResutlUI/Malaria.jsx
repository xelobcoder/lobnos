import React from 'react'

export default function Malaria({result,testname}) {
  return (
      <div>
        {result.length > 0 && (
          <table className='table mt-5'>
            <thead className='table-primary text-uppercase p-0'>
              <tr>
                <th>test name</th>
                <th>result</th>
                <th>flag</th>
                <th>species</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{testname}</td>
                <td>{result[0]?.['PARASITENUMBER']} parasites</td>
                <td></td>
                <td>{result[0]?.['SPECIES']}</td>
              </tr>
            </tbody>
          </table>
        )}
    </div>
  )
}
