import React, { useEffect } from 'react'

export default function EsrResultUI({ result, testname }) {

  return (
    <div>
      {result.length > 0 && (
        <>
          <table id='custom-table' className='mt-3'>
            <thead>
              <tr>
                <th>testname</th>
                <th>result</th>
                <th>reference range</th>
              </tr>
            </thead>
            <tbody>
              <td>erthyrocyte sedimentation rate </td>
              <td>{result[0]?.['value']}</td>
            </tbody>
          </table>
          <div>
            <h4>comments</h4>
            {result[0]?.['comments']}
          </div>
        </>
      )}
    </div>
  )
}
