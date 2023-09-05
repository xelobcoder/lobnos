import React from 'react'

export default function Widal({ result, testname }) {
  console.log(result, testname)
  return (
    <div>
      {result.length > 0 && (
        <div>
          <div className='d-flex justify-content-center'>
            <h5 className='text-capitalize mt-1'>{testname} {' '} test report
            </h5>
          </div>
          <table className='table'>
            <thead className='table-primary text-capitalize p-0'>
              <tr>
                <th>paramater</th>
                <th>result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PARATYPHIAH</td>
                <td>{result[0]?.['PARATYPHIAH']} parasites</td>
              </tr>
              <tr>
                <td>PARATYPHIBH</td>
                <td>{result[0]?.['PARATYPHIBH']} parasites</td>
              </tr>
              <tr>
                <td>TYPHIH</td>
                <td>{result[0]?.['TYPHIH']} parasites</td>
              </tr>
              <tr>
                <td>TYPHIO</td>
                <td>{result[0]?.['TYPHIO']} parasites</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
