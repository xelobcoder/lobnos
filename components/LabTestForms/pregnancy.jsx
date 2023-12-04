import React, { useCallback, useEffect, useState } from 'react'
import Indicator from '../accessories/Reports/indicator'
import CommentSection from './commentSection';
import { getHematologicalResultEntered, handleComments, validateFormData } from '../Auth/customFetch';
import ISLOADING from '../isLoading';
import { toast,ToastContainer } from 'react-toastify';

export default function Pregnancy({ clientdata }) {
  const {billingid,test,testid,patientid} =clientdata
  const [resultEntered, setResultsEntered] = useState(false)
  const [loading, setLoading] = useState(true);
  const option = ['positive', 'negative'];
  const method = ['Urine', 'Blood'];
  const [result, setResults] = useState({value: '',method: '',comments: '' })


  // this handles Results of the test form

  const handleResult = async function () {
    const handleResponse = async function (response) {
      const { statusCode, status, message } = response;
      if (statusCode == 200 && status == 'success') {
        toast.success(message, { autoClose: 500 })
        setResultsEntered(true);
      }
      else {
        toast.error(message, { autoClose: 500 })
      }
    }
    const data = { ...result, testname: test, billingid, patientid, testid }
    console.log(data)
    await validateFormData(data,true,[],'test/result/enter', handleResponse)
  }


  const getPreviousResult = useCallback( async function () {
    getHematologicalResultEntered(billingid, test, setLoading, setResults, setResultsEntered);
  },[billingid, test])

  useEffect(() => {
    getPreviousResult();
  }, [getPreviousResult])

  console.log(result)




  return (
    <>
      <ToastContainer/>
      <div className="mx-3">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Pregnancy Test</h4>
            <Indicator resultEntered={resultEntered} />
          </div>
          <div className="card-body">
            {loading && <ISLOADING />}
            {!loading && (
              <div className='list-group'>
                <div className="list-group-item">
                <label className="col-sm-2 col-form-label">Method</label>
                <select className="custom-select" aria-label="Default select example" value={result.method} onChange={(e) => setResults({ ...result, method: e.target.value })}>
                  <option value="">Select Method</option>
                  {method.map((value, index) => <option key={index} value={value}>{value}</option>)}
                </select>
                </div>
                
          <div className="list-group-item">
                <label className="col-sm-2 col-form-label">Reaction</label>
                <select className="custom-select" aria-label="Default select example" value={result.value} onChange={(e) => setResults({ ...result, value: e.target.value })}>
                  <option value="">Select Reaction</option>
                  {option.map((value, index) => <option key={index} value={value}>{value}</option>)}
                </select>
              </div>
                <div className='list-group-item'>
                <CommentSection
                getcomment={handleComments}
                datafunction={setResults}
                target={"comments"}
                value={result.comments}
                datasource={result}
              />
              </div>
                <div className='list-group-item'>
                <button type='button' onClick={(e) => handleResult(e)} className='btn btn-primary btn-sm' sx={{ mt: 2 }}>
                save results
              </button >
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
