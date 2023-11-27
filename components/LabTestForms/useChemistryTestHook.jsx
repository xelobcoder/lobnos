import React, { useState, useEffect, useCallback } from "react";
import CommentSection from "./commentSection";
import Indicator from "../accessories/Reports/indicator";
import { customFetch,validateFormData, handleComments, CheckResultEntered } from "../Auth/customFetch";
import ISLOADING from "../isLoading";
import { ToastContainer,toast } from "react-toastify";

export default function UseChemistryTestHook({ clientdata, testname }) {
  const { billingid, test, testid, patientid } = clientdata;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [resultEntered, setResultEntered] = useState(false);
  const [comments, setComments] = useState({ comments: "" });

  const handleChange = (name, value) => {
    const updatedSetup = data.map((item) => {
      if (item.parameter === name) {
        return { ...item, value };
      }
      return item;
    });
    setData(updatedSetup, data);
  };

  const getCommentsData = useCallback(
    async function () {
      setComments({ comments: "" });
      const getcomments = await customFetch(`result/preview/comments?billingid=${billingid}&&testid=${testid}`);
      const { statusCode, result } = getcomments;
      if (statusCode == 200) {
        setComments({ comments: result[0]?.comments });
      }
    },
    [billingid, testid]
  );

  const getTestData = useCallback(
    async function () {
      const isResultEntered = await CheckResultEntered(test, billingid);
      const { statusCode, message, result, records } = isResultEntered;
      if (result == true && statusCode == 200) {
        setResultEntered(true);
        setData(records);
        setLoading(false);
      } else {
        toast.error(message);
      }
    },
    [billingid, test]
  );

  const saveResult = async () => {
    const forwardingData = {
      testname: test,
      testid,
      patientid,
      billingid,
      records: data,
      comments: comments.comments,
    };
    const handleResponse = (response) => {
      const { status, statusCode, message } = response;
      if (status) {
        toast.success(message);
        setResultEntered(true);
      } else {
        toast.error(message);
      }
    };
    await validateFormData(forwardingData, true, [], "test/result/enter",handleResponse);
  };

  useEffect(() => {
    try {
      getTestData();
      getCommentsData();
    } catch (error) {
      console.log(error);
    }
  }, [billingid, testid, test, getTestData, getCommentsData]);

  return (
    <>
      <ToastContainer />
      <div className="mx-3">
        <div className="card m-0 br-5">
          <div className="card-header modal-color">
            <h5>{testname}</h5>
            <Indicator resultEntered={resultEntered} />
          </div>
          <div className="card-body ">
            {loading && <ISLOADING />}
            {!loading && data.length !== 0 && (
              <table className="m-0 billing-cart-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Unit</th>
                    <th>Reference Range</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-bottom">
                      <td className="lims-text-color">{item.parameter}</td>
                      <td>
                        <input
                          type="number"
                          style={{ height: "30px" }}
                          className="custom-input"
                          step="0.5"
                          value={item.value}
                          onChange={(e) => handleChange(item.parameter, e.target.value)}
                        />
                      </td>
                      <td>{item.unit}</td>
                      <td>
                        {item.upper} - {item.lower}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <CommentSection
          getcomment={handleComments}
          datasource={comments}
          datafunction={setComments}
          target="comments"
          value={comments.comments}
        />
        <button className="btn btn-primary btn-sm" onClick={saveResult}>
          Save Result
        </button>
      </div>
    </>
  );
}
