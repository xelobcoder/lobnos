import React, { useState, useEffect } from 'react'

export default function UrinalysisUI({ result, testname }) {
  const [parameters, setParameters] = useState(result[0] || { keys: [], values: [] })
  const [comments, setComments] = useState('')


  useEffect(() => {
    if (result.length > 0 && typeof result[0] === 'object') {
      const obj = result[0]
      setComments(obj.remarks)
      delete obj.urinalysisKey;
      delete obj.patientid;
      delete obj.remarks;
      delete obj.billingid;
      
      setParameters(obj)
    }
  }, [])
  return (
    <div>
      {result.length > 0 && (
        <table id='custom-table' className='mt-5'>
          <thead className='table-dark'>
            <tr>
              <th>paramaters</th>
              <th>values</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(parameters).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div>
        <h4>comments</h4>
        {comments}
      </div>
    </div>
  )
}
