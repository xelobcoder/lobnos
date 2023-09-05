import React, { useState } from 'react'
import Indicator from '../accessories/Reports/indicator'
import CommentSection from './commentSection'
import { Button } from '@mui/material'
import { handleComments, handleResponse, validateFormData, handleChangeWithState, CheckResultEntered } from '../Auth/customFetch'
import { useEffect } from 'react'

export default function Helicobacter_Pylori({ clientdata }) {
  const [data, setData] = useState({ specimen: '', result: '', comments: '' });
  const [resultEntered, setResultEntered] = useState(false);
  const { billingid, test, testid, patientid } = clientdata;


  const handleResult = async () => {
    await validateFormData({ ...data, billingid, testname: test, testid, patientid }, true, [], 'test/result/enter', handleResponse);
  }

  useEffect(() => {
    const getResultState = async function () {
      const resultState = await CheckResultEntered(test, billingid);
      const { statusCode, message, result, records } = resultState;
      if (result == true && statusCode == 200) {
        setResultEntered(true);
        setData(records[0]);
      }
    }

    getResultState();
  }, [])


  return (
    <>
      <div className='p-4'>
        <h5>Helicobacter Pylori</h5>
        <Indicator resultEntered={resultEntered} />
        <form>
          <label>specimen type</label>
          <select className='custom-input'
            value={data.specimen}
            onChange={(e) => handleChangeWithState(e, 'specimen', setData, data)} >
            <option value='stool'>stool</option>
            <option value='blood'>blood</option>
          </select>
          <label>result</label>
          <select className='custom-input'
            value={data.result}
            onChange={(e) => handleChangeWithState(e, 'result', setData, data)}>
            <option value='reactive'>
              reactive
            </option>
            <option value='non reactive'>
              non reactive
            </option>
          </select>
          <CommentSection
            target={'comments'}
            datasource={data}
            value={data.comments}
            getcomment={handleComments}
            datafunction={setData}
          />
          <Button
            onClick={handleResult}
            variant='contained' color='primary'>
            save changes
          </Button>
        </form>

      </div>
    </>
  )
}
