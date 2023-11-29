import React, { useEffect, useState } from 'react'
import Indicator from '../accessories/Reports/indicator'
import { Autocomplete, TextField, Button } from '@mui/material';
import CommentSection from './commentSection';
import { CheckResultEntered, handleComments, validateFormData } from '../Auth/customFetch';

export default function Pregnancy({ clientdata }) {
  const [resultEntered, setResultsEntered] = useState(false)
  const option = ['positive', 'negative'];
  const method = ['Urine', 'Blood'];
  const [result, setResults] = useState({
    reaction: '',
    method: '',
    comments: ''
  })


  // this handles Results of the test form

  const handleResult = async function () {
    await validateFormData({
      ...result,
      billingid: clientdata.billingid,
      testname: clientdata.test,
      patientid: clientdata.patientid,
      testid: clientdata.testid
    },
      true,
      [],
      'test/result/enter'
      ,
      function (response) {
        const { statusCode, status, message } = response;

        if (statusCode == 200 && status == 'success') {
          alert(message);
          setResultsEntered(true);
        }
        else {
          alert(message)
        }
      })
  }

  useEffect(() => {
    const { billingid } = clientdata;
    async function getInputedData() {
      let response = await CheckResultEntered('pregnancy_test', billingid)
      const { statusCode, records, result } = response;
      if (statusCode === 200 && result == true) {
        // map and filter records
        setResultsEntered(true)
        setResults({
          method: records[0]['METHOD'],
          reaction: records[0]['VALUE'],
          comments: records[0]['COMMENTS']
        })

      }
    }

    getInputedData()
  }, [resultEntered])





  return (
    <>
      <div className="mx-3">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Pregnancy Test</h4>
            <Indicator resultEntered={resultEntered} />
          </div>
          <div className="card-body">
            <form>
              <div className="form-row">
                <label className="col-sm-2 col-form-label">Method</label>
                <select className="custom-select col-sm-4" aria-label="Default select example" value={result.method} onChange={(e) => setResults({ ...result, method: e.target.value })}>
                  <option value="">Select Method</option>
                  {method.map((value, index) => <option key={index} value={value}>{value}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label className="col-sm-2 col-form-label">Reaction</label>
                <select className="custom-select col-sm-4" aria-label="Default select example" value={result.reaction} onChange={(e) => setResults({ ...result, reaction: e.target.value })}>
                  <option value="">Select Reaction</option>
                  {option.map((value, index) => <option key={index} value={value}>{value}</option>)}
                </select>
              </div>
              <CommentSection
                getcomment={handleComments}
                datafunction={setResults}
                target={"comments"}
                value={result.comments}
                datasource={result}
              />
              <button type='button' onClick={(e) => handleResult(e)} className='btn btn-primary btn-sm' sx={{ mt: 2 }}>
                save results
              </button >
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
