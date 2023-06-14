import React, { useState, useEffect } from 'react';

export default function HepatitisBProfileUI({ result, testname }) {
  const [parameters, setParameters] = useState(result[0] || {});
  const [comments, setComments] = useState('')

  useEffect(() => {
    if (result.length > 0 && typeof result[0] === 'object') {
      const obj = { ...result[0] };
      setComments(obj?.COMMENTS)
      delete obj.ID;
      delete obj.PATIENTID;
      delete obj.SCIENTIST;
      delete obj.UPDATED_ON;
      delete obj.BILLINGID;
      delete obj.CREATED_ON;
      delete obj?.COMMENTS;
      setParameters(obj);
    }
  }, [result]);

  return (
    <div>
      {Object.keys(parameters).length > 0 && (
        <>
          <table id='custom-table' className='mt-4'>
            <thead className='table-dark p-0'>
              <tr>
                <th>Parameters</th>
                <th>Values</th>
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
        </>
      )}
      <div>
        {comments}
      </div>
    </div>
  );
}
