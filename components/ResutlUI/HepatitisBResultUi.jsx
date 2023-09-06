import React from 'react'

export default function HepatitisBResultUi({ testname, result }) {
  return (
    <>
      {result.length > 0 && (
        <div>
          <table className='table'>
            <thead className='table-primary text-uppercase p-0'>
              <tr>
                <th>test name</th>
                <th>result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{testname}</td>
                <td>{result[0]?.['RESULTS']}</td>
              </tr>
            </tbody>
          </table>
          <div>
            <h4>Comments</h4>
            <hr></hr>
            <h6>
              {result[0]?.['REMARKS']}
            </h6>
          </div>
        </div>
      )}
    </>
  )
}


