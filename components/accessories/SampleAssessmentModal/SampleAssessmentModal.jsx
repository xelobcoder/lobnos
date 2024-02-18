import React, { useState, useCallback, useEffect } from "react";
import { Modal } from "react-bootstrap";
import {customPost,getDataAndUpdateState,} from "../../Auth/customFetch";
import ISLOADING from "../../isLoading";
import { ToastContainer, toast } from "react-toastify";


export default function SampleAssessmentModal({show,hide,billingid,removeClient}) {
  const [loading, setLoading] = useState(true);
  const [testcollection, setTestCollection] = useState([]);

  const getClientAscention = useCallback(async (id) => {
    getDataAndUpdateState(
      setTestCollection,
      `phelobotomy/sample/assesment/list?billingid=${id}`
    );
  }, []);

  useEffect(() => {
    if (show) {
      getClientAscention(billingid);
      setLoading(false);
    }
  }, [billingid, getClientAscention, show]);

  const validateSample = async (id, sat) => {
    const status = sat === "accept" ? 1 : 0;
    setTestCollection((prev) => {
      return prev.map((item) => {
        if (item.testid == id) {
          if (status == 1) {
            return {
              ...item,
              validatedby: 1,
              approvalstatus: status,
              declinemessage: null,
              validatedon: new Date(),
            };
          }
          return {
            ...item,
            approvalstatus: status,
            validatedby: 1,
            validatedon: new Date(),
          };
        }
        return item;
      });
    });
  };

  const handleDeclineMessage = async (ev, id) => {
    const message = ev.target.value;
    setTestCollection((prev) => {
      return prev.map((item) => {
        if (item.testid == id) {
          return { ...item, rejectionmessage: message };
        }
        return item;
      });
    });
  };

  const handleSubmit = async (ev) => {
    const pushResponse = await customPost("sample", "PUT", { testcollection });
    const { status, message, statusCode } = pushResponse;
    if (statusCode == 200 && status == "success") {
     toast.success(message);
     hide();
     removeClient(billingid);
    } else{
      toast.error(message);
    }
  };
  return (
    <>
      <ToastContainer />
      <Modal show={show} backdrop="static" size="xl" onHide={hide} scrollable>
        <Modal.Header closeButton>
          <h5>Sample Assessment And Validation</h5>
        </Modal.Header>
        <Modal.Body>
          {loading && testcollection.length == 0 && <ISLOADING />}
          {!loading && testcollection.length == 0 && <h5>No sample to assess</h5>}
          {!loading && testcollection.length > 0 && (
            <table className="billing-cart-table">
              <thead>
                <tr>
                  <th>ascension No.</th>
                  <th>test</th>
                  <th>sample</th>
                  <th>sample status</th>
                  <th>validation status</th>
                  <th>reason for rejection</th>
                  <th>actions</th>
                </tr>
              </thead>
              <tbody>
                {testcollection.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>ASCID{item?.id}</td>
                      <td>
                        <span>{item.name}</span>
                        <span>
                          {item.approvalstatus == 1 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="green"
                              class="bi bi-check-lg"
                              viewBox="0 0 16 16">
                              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" class="bi bi-x" viewBox="0 0 16 16">
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                            </svg>
                          )}
                        </span>
                      </td>
                      <td>{item.sample}</td>
                      <td>{item.collection == "true" ? "collected" : "N/A"}</td>
                      <td>
                        {item.approvalstatus == 1 ? (
                          <span className="text-success">accepted</span>
                        ) : item.approvalstatus == 0 ? (
                          <span className="text-danger">rejected</span>
                        ) : (
                          <span>N/A</span>
                        )}
                      </td>
                      <td>
                        <textarea
                          value={item?.rejectionemessage}
                          onChange={(ev) => {
                            handleDeclineMessage(ev, item?.testid)
                          }}
                          disabled={item?.approvalstatus === 1}
                          className="form-control"
                          rows="2"></textarea>
                      </td>
                      <td>
                        <div  className="d-flex justify-content-between">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(ev) => {
                              validateSample(item?.testid, "accept")
                            }}>
                            accept
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={(ev) => {
                              validateSample(item?.testid, "reject")
                            }}>
                            reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-primary btn-sm"
            onClick={(ev) => {
              handleSubmit(ev)
            }}>
            Save
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={(ev) => {
              hide()
            }}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
