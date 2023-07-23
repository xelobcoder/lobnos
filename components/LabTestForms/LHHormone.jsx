import React, { useState, useEffect } from 'react'
import Indicator from '../accessories/Reports/indicator'
import CommentSection from './commentSection';
import { handleComments, customFetch ,validateFormData,handleResponse} from '../Auth/customFetch';
import { Button } from '@mui/material';
export default function LHHormone({ clientdata }) {
  const { billingid, patientid, test, testid } = clientdata;

  const defaultParameter = {
    parameter: 'lh',
    value: '',
    comment: ''
  };

  const [result, setResult] = useState(defaultParameter);
  const [resultEntered, setResultEntered] = useState(false);
  console.log(test)

  // check if rsult was previously entered on the database

  const getPreviousResult = async () => {
    // fetch result from database
    // if result is found, set result to the fetched result
    // else set result to defaultParameter
    const response = await customFetch(`test/result/check?testname=${test}&billingid=${billingid}`);
    // destructuring the response
    const { result, statusCode, records } = response;
    if (statusCode == 200 && result == true) {
      setResult(records[0]);
      setResultEntered(true)
    }
  }


  useEffect(() => {
    getPreviousResult();
  }, [])



  // push  result to database
  const handleResult = async (e) => {
    await validateFormData(
      { ...result, billingid, patientid, testname: test, testid },
      true,
      [],
      'test/result/enter',
      handleResponse
    );
  }
  return (
    <>
      <div className='p-4'>
        <div>
          <h5>Leutinizing  Hormone (LH)</h5>
          <Indicator resultEntered={resultEntered} />
          <form className='bg-white'>
            <div >
              <table id='entry-table-chemistry'>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Unit</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>LH</td>
                    <td><input type='text' value={result.value} onChange={(e) => setResult({ ...result, value: e.target.value })} /></td>
                    <td>U/L</td>
                    <td>2.4-12.6</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
          <CommentSection
            target={'comment'}
            getcomment={handleComments}
            datasource={result}
            datafunction={setResult}
            value={result.comment}
          />
          <Button variant='contained' color='primary' className='mt-4' onClick={handleResult}>
            Submit
          </Button>

        </div>
      </div>
    </>
  )
}
