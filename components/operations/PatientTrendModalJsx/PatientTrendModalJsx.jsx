import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { customFetch, customPost } from "../../Auth/customFetch";
import TrendSingleList from "./TrendSingleList";
import ISLOADING from "../../isLoading";
export default function PatientTrendModalJsx({ show, hide, data }) {
  const { test, patientid, billingid, testid } = data;
  const [instances, setInstances] = useState(5); // [5,6,7,8,9]
  const [loading, setLoading] = useState(true);
  const [dataSet, setDataSet] = useState({
    trend: [],
    category: null,
    parameters: [],
  });

  const handleTrendView = async () => {
    const response = await customFetch(
      `result/patientrend/single?billingid=${billingid}&&patientid=${patientid}&&test=${test}&&testid=${testid}&&instances=${instances}`
    );

    const { statusCode, status, result } = response;
    
    if (statusCode == 200 && status == "success") {
      const { parameters, trend, category } = result;
      setDataSet({ parameters, trend, category });
      setLoading(false);
    } else {
      setDataSet({ parameters: [], trend: [], category: null });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientid != null) {
      handleTrendView();
    }
  }, [patientid]);

  return (
    <div>
      <Modal show={show} size="xl" backdrop="static" onHide={hide}>
        <Modal.Header closeButton>
          <div className="d-flex justify-content-between">
            <h5 className="mt-2">Test Trend Analysis</h5>
            <div>
              <select
                className="form-control mx-3"
                value={instances}
                onChange={(ev) => {
                  setInstances(parseInt(ev.target.value));
                }}>
                <option>select number of instance</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={9}>9</option>
              </select>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <ISLOADING />
          ) : (
            <>
              {dataSet.parameters.length > 0 && dataSet.trend.length > 0 ? (
                <table className="d-flex billing-cart-table x-trend br-5" style={{ border: "0px !important" }}>
                  <tbody>
                    <tr className="d-flex flex-column">
                      <td>parameters</td>
                      {dataSet.parameters.map((item, index) => {
                        return <td key={index}>{item}</td>;
                      })}
                    </tr>
                  </tbody>
                  {dataSet.trend.length > 0 ? (
                    dataSet.trend.map((item, index) => {
                      return <TrendSingleList parameters={dataSet.parameters} key={index} dataSet={item} />;
                    })
                  ) : (
                    <h3 className="text-center">No Data Found</h3>
                  )}
                </table>
              ) : (
                <h3 className="text-center">No Data Found</h3>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
