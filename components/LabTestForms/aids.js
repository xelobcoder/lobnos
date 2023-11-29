import { useEffect,useState } from "react";
import CommentSection from "./commentSection";
import { CheckResultEntered, handleComments, validateFormData } from "../Auth/customFetch";
import Indicator from "../accessories/Reports/indicator";
import { toast, ToastContainer } from "react-toastify";
export default function AIDS ({ clientdata }) {
  const { billingid, testid, test, patientid } = clientdata;
  const [resultEntered, setResultEntered] = useState(false);
  const [results, setResults] = useState({reaction: '',comments: ''});
  const options = ['reactive', 'non reactive'];

  const handleResult = async function (e) {
    const handleResponse = function (response) { 
      const { status, statusCode, message } = response;
      if (status === 'success' && statusCode == 200) {
        toast.success(message)
        setResultEntered(true);
      } else {
        toast.error(message);
      }
    }
    const newdata = { ...results, billingid, patientid, testid, testname: test }
    await validateFormData(newdata, true, [], 'test/result/enter',handleResponse)
  }


  const getData = async function () { 
    const response = await CheckResultEntered(test, billingid);
    const { result, statusCode, message, records } = response;
    // if result is true
    if (result && statusCode == 200 && records.length > 0) {
      // make indicator turn green to indicate result was previously entered
      setResultEntered(true);
     setResults(records[0])
    }
  }

  useEffect(() => {
   if (billingid) { getData() }
 },[])

  return (
    <>
      <ToastContainer />
      <div className="p-4">
        <div className="card">
        <div className="card-header">
          <h4>A.I.D.S</h4>
          <Indicator resultEntered={resultEntered} />
        </div>
          <div className="card-body">
          <div className="form-row">
            <label className="col-md-4 col-form-label">HIV 1</label>
              <select className="custom-input" name="reaction" value={results.reaction}
                onChange={(ev) => {setResults({...results,reaction: ev.target.value})}}>
              <option value="">select</option>
              {options.map((option, index) => <option key={index} value={option}>{option}</option>)}
            </select>
          </div>
          <CommentSection getcomment={handleComments} target={'comments'} datasource={results} datafunction={setResults} value={results.comments} />
          <button  className="btn btn-primary btn-sm" type="button"
            onClick={handleResult}
            sx={{ mt: 3 }}>save changes</button >
        </div>
     </div>
      </div>
    </>
  )
}
