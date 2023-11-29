import { useState } from "react";
import CommentSection from './commentSection';
import { CheckResultEntered, handleComments, handleResponse, validateFormData } from "../Auth/customFetch";
import { useEffect } from "react";
import Indicator from "../accessories/Reports/indicator";
export default function ESR({ clientdata }) {
  const { billingid, patientid, testid, test } = clientdata;
  const [result, setResult] = useState({ value: '', comments: '' });
  const [resultEntered,setResultEntered] = useState(false);


  const handleResult = async (e) => {
    const formdata = { ...result, testname: 'esr', patientid, billingid, testid }
    await validateFormData(formdata, true, [], 'test/result/enter', handleResponse)
  }


  useEffect(() => {
    async function checkResult() {
      const response = await CheckResultEntered('esr', billingid);
      const {records,status, result} = response;
      if(result) {
        setResultEntered(true);
        setResult(records[0])
      }
    }

    checkResult()
  }, [billingid])
  return (
    <>
      <div className="mx-3" >
        <div className="card">
          <div className="card-header">
            <h5>Erthrocyte Sedimentation Rate (ESR)</h5>
            <Indicator resultEntered={resultEntered} />
          </div>
          <div className="card-body">
            <div style={{ width: "100%" }}>
              <label className="form-label">ESR</label>
              <input
            type="number"
                className="custom-input"
                label="ESR"
            value={result.value}
            onChange={(e) => setResult({ ...result, value: e.target.value })}
          />
        </div>
        <CommentSection getcomment={handleComments} target={'comments'} datasource={result} datafunction={setResult} value={result.comments} />
            <button 
          onClick={(e) => handleResult(e)}
              className="mt-1 btn btn-primary btn-sm"
          type="button"
        >
          save result
            </button >
          </div>
        </div>
      </div>
    </>
  );
}