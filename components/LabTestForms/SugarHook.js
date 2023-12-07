import { useEffect, useState } from "react";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";
import {  Glucoseoptions, getHematologicalResultEntered, handleComments, validateFormData } from "../Auth/customFetch";
import ISLOADING from "../isLoading";
import {ToastContainer,toast} from 'react-toastify';

export default function SugarHook({employeeid, clientdata}) {
  const { billingid, test, testid, patientid } = clientdata;
  const [data, setData] = useState({result: 0,unit: '',comments: "" });
  const [resultEntered, setResultEntered] = useState(false);
  const [loading, setLoading] = useState(true);
  const testname = test ? test.split("_").join(" ") : '';
  
  useEffect(() => {
    if (billingid && test) {
      getHematologicalResultEntered(billingid, test, setLoading, setData, setResultEntered);
    }
  }, [billingid, test]);

  const handleResult = async function () {
    const handleCalback = async function (response) {
      const { status, message, statusCode } = response;
      if (status == 'success' && statusCode == 200) {
      toast.success(message,{autoClose:500});
      } else {
        toast.error(message,{autoClose:500});
      }
    }
    const requestBody = { ...data, testname: test, testid, patientid, billingid,employeeid }
    await validateFormData(requestBody, true, [], 'test/result/enter', handleCalback)
  }
  return (
    <>
      <ToastContainer />
      <div className="mx-3">
        <div className="card">
          <div className="card-header modal-color">
            <h4 className="text-capitalize">{ testname}</h4>
                <Indicator resultEntered={resultEntered} />
            </div>
            <div className="card-body">
            {loading && <ISLOADING />}
            {!loading && (
              <>
                <div>
            <label>Value</label>
            <input 
             className="form-control"
              type="number"
              size='small'
              value={data.result}
              onChange={(e) =>
                setData({ ...data, result: e.target.value })
              }
            />
          </div>
          <div>
            <label>Unit</label>
            <select className="form-control"   value={data.unit}  onChange={(e) => setData({ ...data, unit: e.target.value })}>
              <option>select option here </option>
              {
                Glucoseoptions.map((item, index) => {
                  return (
                    <option key={index} value={item}>{item }</option>
                  )
                })
              }
           </select>
          </div>
          <CommentSection
            value={data.comments}
            datafunction={setData}
            datasource={data}
            target={'comments'}
            getcomment={handleComments}

          />
          <div className="form-group mt-3">
            <button
             className="btn btn-primary btn-sm"
              onClick={(e) => handleResult(e)}
            >
              save result
            </button>
          </div>
              </>
            )}
            </div>
         </div>
      </div>
    </>
  );
}
