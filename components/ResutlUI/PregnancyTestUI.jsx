import React from 'react'

export default function PregnancyTestUI({ result, testname }) {
  return (
    <div>
      <div>
        {result.length > 0 && (
          <>
            <table className='table mt-2'>
              <thead className='table-primary text-capitalize p-0'>
                <tr>
                  <th>test name</th>
                  <th>sample</th>
                  <th>result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pregnacy test</td>
                  <td>{result[0]?.['METHOD']}</td>
                  <td>{result[0]?.['VALUE']}</td>
                </tr>
              </tbody>
            </table>
            <div>
              <h4 className='text-capitalize'>comments</h4>
              <p>{result[0]?.['COMMENTS']}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
