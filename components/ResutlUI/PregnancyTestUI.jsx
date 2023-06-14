import React from 'react'

export default function PregnancyTestUI({ result, testname }) {
  return (
    <div>
      <div>
        {result.length > 0 && (
          <table className='table mt-5'>
            <thead className='table-dark text-uppercase p-0'>
              <tr>
                <th>test name</th>
                <th>sample</th>
                <th>result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>pregnacy test</td>
                <td>{result[0]?.['METHOD']}</td>
                <td>{result[0]?.['VALUE']}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
