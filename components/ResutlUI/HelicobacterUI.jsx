import React from 'react'

export default function HelicobacterUI({ result, testname }) {
  const comments = result[0]?.['comments'];
  return (
    <>
      <div>
        <div className='d-flex justify-content-center'>
          <h5 className='text-capitalize mt-1'>{testname} {' '} test report
          </h5>
        </div>
        {result.length > 0 && (
          <div>
            <table className='table'>
              <thead className='table-primary text-capitalize p-0'>
                <tr>
                  <th>specimen</th>
                  <th>result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result[0]?.['specimen']}</td>
                  <td>{result[0]?.['result']}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div>
              <h4 className='text-capitalize'>comments</h4>
              <p>{comments}</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
