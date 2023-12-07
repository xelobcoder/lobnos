import  { useState, useEffect, useCallback } from "react";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";
import {handleComments, validateFormData, getHematologicalResultEntered } from "../Auth/customFetch";
import { ToastContainer, toast } from "react-toastify";
import ISLOADING from '../isLoading';

export default function UseHepHook({clientdata,employeeid}) {
  const { billingid, patientid, testid,test } = clientdata;
  // state for handling if result was previously entered
  const [resultEntered, setResultEntered] = useState(false);
  const [loading,setLoading] = useState(true);
  const option = ['reactive', 'non reactive'];
  const [result, setResults] = useState({results: '',comments: ''});


  const handleTestResult = async (e) => {
    const handleResponse = async (response) => { 
      console.log(response)
      const { status, statusCode, message } = response;
      if (status === 'success' && statusCode === 200) {
        toast.success(message,{autoClose: 500})
        setResultEntered(true);
      } else {
        toast.error(message,{autoClose: 500})
      }
    }
    const formdata = { ...result, billingid, patientid, testid, testname:test, employeeid}
    await validateFormData(formdata, true, [], 'test/result/enter',handleResponse)
  }

  const getPreviousResult = useCallback(async () => { 
   getHematologicalResultEntered(billingid,test,setLoading,setResults,setResultEntered)
  },[billingid,test])

  useEffect(() => {
    getPreviousResult()
  }, [getPreviousResult])



  return (
    <>
      <ToastContainer/>
      <div className="mx-3">
        <div className="card">
          <div className="card-header">
            <h4 className="text-capitalize">{test.split("_").join(" ")} test</h4>
            <Indicator resultEntered={resultEntered} />
          </div>
          <div className="card-body">
            {loading && (<ISLOADING />)}
            {!loading && (
              <>
               <form className="mb-3">
              <select className="form-control" value={result.results} onChange={(e) => setResults({ ...result, results: e.target.value })}>
              <option >select an option here </option>
              {option.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </form>
          <CommentSection
            value={result.comments}
            target={"comments"}
            getcomment={handleComments}
            datasource={result}
            datafunction={setResults}
          />
          <button className="btn btn-primary btn-sm my-3 mx-1" onClick={(e) => handleTestResult(e)}>
            {resultEntered ? "update result" : "enter result"}
          </button >
              </>
            )}
        </div>
        </div>
      </div>
    </>
  );

}
