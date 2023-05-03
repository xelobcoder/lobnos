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
      <div className="p-4">
        <div>
          <Indicator resultEntered={resultEntered} />
          <form>
            <Autocomplete
              options={option}
              getOptionLabel={(option) => option}
              value={result.reaction}
              size='small'
              onChange={(event, newValue) => {
                setResults({
                  ...result, reaction: newValue
                })
              }}
              renderInput={(params) => <TextField {...params} label="Pregnancy test" variant="outlined" />}
            >
            </Autocomplete>
            <div className='form-group mt-3'>
              <Autocomplete
                options={method}
                getOptionLabel={(method) => method}
                value={result.method}
                size='small'
                onChange={(event, newValue) => {
                  setResults({
                    ...result, method: newValue
                  })
                }}
                renderInput={(params) => <TextField {...params} label="method of  test" variant="outlined" />}
              >
              </Autocomplete>
            </div>
            <CommentSection getcomment={handleComments} datafunction={setResults} target={'comments'} value={result.comments} datasource={result} />
          </form>
          <Button variant='contained' onClick={(e) => handleResult(e)} color='primary' sx={{ mt: 2 }}>save results</Button>
        </div>
      </div>
    </>
  )
}
