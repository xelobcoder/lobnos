import React, { useCallback, useEffect, useState } from "react";
import Indicator from "../accessories/Reports/indicator";
import CommentSection from "./commentSection";
import { CheckResultEntered, handleComments, handleResponse, validateFormData } from "../Auth/customFetch";

export default function Syphilis({ clientdata }) {
  const { billingid, patientid, test, testid } = clientdata;
  const [result, setResult] = useState({ sampletype: "", reaction: "", result: "", comments: "" });
  const [resultEntered, setResultEntered] = useState(false);

  const handleSubmitResult = async (e) => {
    const data = { ...result, billingid, patientid, testname: test, testid };
    await validateFormData(data, true, [], "test/result/enter", handleResponse);
  };

  const isResultEntered = useCallback(async () => {
    try {
      const response = await CheckResultEntered(test, billingid);
      const { result, message, status, records } = response;
      setResultEntered(result);
      result && setResult(records[0]);
    } catch (error) {
      console.log('error connecting to server!!')
    }
  },[test, billingid]);

  useEffect(() => {
    if (test && billingid) {
      isResultEntered();
    }
  }, [test, billingid, isResultEntered]);

  return (
    <div className="mx-3">
      <div className="card">
        <div className="card-header p-2">
          <h4> Syphilis</h4>
          <Indicator resultEntered={resultEntered} />
        </div>
        <div className="card-body">
          <table className="billing-cart-table">
            <thead>
              <tr>
                <th>query</th>
                <th>value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="lims-text-color">sampletype</td>
                <td>
                  <select
                    className="custom-select"
                    value={result.sampletype}
                    onChange={(e) => setResult({ ...result, sampletype: e.target.value })}>
                    <option value="">select</option>
                    <option value="serum">serum</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="lims-text-color">reaction</td>
                <td>
                  <select
                    className="custom-select"
                    value={result.reaction}
                    onChange={(e) => setResult({ ...result, reaction: e.target.value })}>
                    <option value="">select</option>
                    <option value="weakly reactive">weakly reactive</option>
                    <option value="reactive">reactive</option>
                    <option value="strongly reactive">strongly reactive</option>
                    <option value="non reactive">non reactive</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="lims-text-color">result</td>
                <td>
                  <select
                    className="custom-select"
                    value={result.result}
                    onChange={(e) => setResult({ ...result, result: e.target.value })}>
                    <option value="">select</option>
                    <option value="positive">positive</option>
                    <option value="negative">negative</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <CommentSection
            getcomment={handleComments}
            datasource={result}
            datafunction={setResult}
            value={result.comments}
            target={"comments"}
          />
          <button
            type="button"
            onClick={(ev) => {
              handleSubmitResult();
            }}
            className="btn btn-primary btn-sm mx-1">
            Save result
          </button>
        </div>
      </div>
    </div>
  );
}
