import React, { useState, useEffect } from 'react'
import CommentSection from './commentSection'
import { Button } from '@mui/material';
import Indicator from '../accessories/Reports/indicator';
import { customFetch, handleComments, handleResponse, validateFormData } from '../../components/Auth/customFetch';

export default function FSHHormone({ clientdata }) {
  const { billingid, patientid, test, testid } = clientdata;

  const defaultParameter = {
    parameter: 'fsh',
    value: '',
    comment: ''
  };

  const [result, setResult] = useState(defaultParameter);
  const [resultEntered, setResultEntered] = useState(false);

  // check if rsult was previously entered on the database

  const getPreviousResult = async () => {
    // fetch result from database
    // if result is found, set result to the fetched result
    // else set result to defaultParameter
    const response = await customFetch(`test/result/check?testname=${test}&billingid=${billingid}`);
    // destructuring the response
    const { result, statusCode,records } = response;
    if (statusCode == 200 && result == true) {
      setResult(records[0]);
      setResultEntered(true);
      console.log(records[0]);
    }
  }


  useEffect(() => {
    getPreviousResult();
  },[])



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
          <h5>Follicle Stimulating Hormone (FSH)</h5>
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
                    <td>FSH</td>
                    <td>
                      <input type='text' value={result.value} onChange={(e) => setResult({ ...result, value: e.target.value })} />
                    </td>
                    <td>U/L</td>
                    <td>3.5-12.5</td>
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
          <Button variant='contained' onClick={handleResult} color='primary' className='mt-4'>
            Submit
          </Button>

        </div>
      </div>
    </>
  )
}
