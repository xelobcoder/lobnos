import React, { useState, useEffect } from "react";
import CommentSection from "./commentSection";
import {ToastContainer,toast} from "react-toastify";
import Indicator from "../accessories/Reports/indicator";
import {CheckResultEntered,customFetch,handleComments,validateFormData} from "../Auth/customFetch";
export default function BetaHcg({ clientdata }) {
  const {billingid,patientid,testid,test} = clientdata;
  const [data, setData] = useState({ value: "", unit: "", comments: "" });
  const [resultEntered, setResultEntered] = useState(false);
  const [reference, setReference] = useState([]);

  const getBetaHcgData = async function () { 
    const getdata = await CheckResultEntered(test, billingid);
    const { statusCode, message, result, records, status } = getdata;
    if (status == "success" && statusCode == 200 && records.length > 0 && result) {
      setData(records[0]);
      setResultEntered(true);
    } else {
      setResultEntered(false);
    }
  }

  const getReference = async function () { 
    const reference = await customFetch(`result/reference/betahcg`);
    const { statusCode, result } = reference;
    if (statusCode == 200) {
      setReference(result);
    }
  }
 
  useEffect(() => {
    if (billingid && test) {
      getBetaHcgData();
      getReference();
     }
  }, []);

  const handleResult = async function () {
    await validateFormData(
      {  ...data,testname: test,billingid: billingid,testid: testid,patientid: patientid },true,[], "test/result/enter",async function (response) {
        const { status, message,statusCode } = response;
        if (status == "success" && statusCode == 200) {
          toast.success(message);
          setResultEntered(true);
        } else {
          toast.error(message);
        }
      }
    );
  };
  return (
    <>
      <ToastContainer/>
     <div className="mx-3">
    <div>
      <div className="card">
        <div className="card-header modal-color">
            <h5>Beta human chorionic hormone (Beta Hcg) test</h5>
            <Indicator resultEntered={resultEntered} />
        </div>
        <div className="card-body">
        <form className="bg-white">
        <table className="billing-cart-table">
          <thead>
            <tr>
              <th>paramater</th>
              <th>value</th>
              <th> unit</th>
              <th>reference</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>beta hcg</td>
              <td>
               <input type="number" className="custom-input" name="" value={data.value}
                          onChange={(e) => setData({ ...data, value: e.target.value })}
                    step={"0.5"}
                />
              </td>
                <td>
                      <input className="custom-input" value={data.unit}  onChange={(ev) => {setData({...data, unit: ev.target.value})}} />
              </td>
              <td>
                (See reference range below)
              </td>
            </tr>
          </tbody>
        </table>
        </form>
              <h3 className="my-2">Reference Ranges Below</h3>
              <table className="billing-cart-table">
                <thead>
                  <tr>
                    <th>week</th>
                    <th>upper</th>
                    <th>lower</th>
                    <th>unit</th>
                  </tr>
                </thead>
                <tbody>
                  {reference.map((item, index)  => {
                    return (
                      <tr key={index}>
                        <td>{item.weeks}</td>
                        <td>{item.upper}</td>
                        <td>{item.lower}</td>
                        <td>{item.unit}</td>
                      </tr>
                    );
                   })}
                </tbody>
              </table>
      <CommentSection
        getcomment={handleComments}
        datasource={data}
        datafunction={setData}
        value={data.comments}
        target={"comments"}
          />
           <button className="btn btn-primary btn-sm" onClick={handleResult} >
        save changes
              </button>
              
        </div>
     </div>
    </div>
  </div>
    </>
  );
}
