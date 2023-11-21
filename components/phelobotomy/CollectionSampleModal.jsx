import React, { useCallback,useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { customPost, getDataAndUpdateState } from "../Auth/customFetch";
import { ToastContainer, toast } from "react-toastify";
import ISLOADING from "../isLoading";


export default function CollectionSampleModal({ show, hide, collection,employeeid }) {
  const { billingid, patientid, fullname } = collection;
  const [loading, setLoading] = useState(true);
  const [testcollection, setTestCollection] = useState([]);
  const [allCollected, setAllCollected] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const getClientAscention = useCallback(async (id) => {
    getDataAndUpdateState(
      setTestCollection,
      `phelobotomy/ascension?billingid=${id}`
    );
  }, []);

  useEffect(() => {
    if (show) {
      getClientAscention(billingid);
      setLoading(false);
    }
  }, [billingid, getClientAscention, show]);

  const collectAll = async () => {
    setTestCollection(
      testcollection.map((item) => {
        return { ...item, collection: allCollected == true ? "false" : "true" };
      })
    );
    setAllCollected(!allCollected);
  };

  const handleIndividualSample = async (item) => {
    const { id } = item;
    setTestCollection((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            collection: "true",
            samplemessage: "",
            collection_date: new Date(),
          };
        }
        return item;
      });
    });
  };

  const handleSampleMessage = async (ev, id) => {
    const message = ev.target.value;
    setTestCollection((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          return { ...item, samplemessage: message };
        }
        return item;
      });
    });
  };

  const handleSubmit = async () => {
    const testinfo = testcollection.map((item) => {
      const { samplemessage, billingid, testid, collection, collection_date } =
        item;
      return { samplemessage, billingid, testid, collection, collection_date };
    });

    const pushResponse = await customPost("phelobotomy", "POST", {testinfo,employeeid, });

    const { status, message, statusCode } = pushResponse;
    if (status == 'success' && statusCode == 200) {
      toast.success(message);
      getClientAscention(billingid);
    } else {
      toast.error(message);
    }
  };

  return (
    <>
      <ToastContainer />
      <Modal
        show={show}
        size={fullscreen ? "fullscreen" : "xl"}
        backdrop="static"
        keyboard="false"
        onHide={hide}
      >
        <Modal.Header
          style={{ backgroundColor: "#e9ecef" }}
          closeButton
          className="d-flex justify-content-between text-capitalize fw-bold"
        >
          <h5 className="fw-bold">
            {fullname}({patientid})
          </h5>
          <h5>
            {"-"}billingid:{billingid}
          </h5>
        </Modal.Header>
        <Modal.Body>
          {(!loading && testcollection.length > 0) && (
            <table className="billing-cart-table m-0">
              <thead>
                <tr>
                  <th>test</th>
                  <th>collected</th>
                  <th>type</th>
                  <th>qty req</th>
                  <th>unit</th>
                  <th>container</th>
                  <th>action</th>
                  <th>message</th>
                </tr>
              </thead>
              <tbody>
                {testcollection.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td
                        className={
                          item.collection == "false" || item.collection == false
                            ? "text-danger"
                            : "text-success"
                        }
                      >
                        {item.collection == "false" || item.collection == false
                          ? "N/A"
                          : "collected"}
                      </td>
                      {item.sample === "SERUM" && (
                        <td className="text-warning">{item.sample}</td>
                      )}
                      {item.sample === "BLOOD" && (
                        <td className="text-danger">{item.sample}</td>
                      )}
                      {item.sample != "BLOOD" && item.sample != "SERUM" && (
                        <td className="text-dark">{item.sample}</td>
                      )}
                      <td>{item.qty_required}</td>
                      <td>{item.unit}</td>
                      <td>{item.sample_container}</td>
                      {item.collection == "true" ? (
                        <td>
                          <span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="currentColor"
                              class="bi bi-check-lg"
                              viewBox="0 0 16 16"
                            >
                              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                            </svg>
                          </span>
                        </td>
                      ) : (
                        <td>
                          <button
                            onClick={(e) => handleIndividualSample(item)}
                            className="btn btn-primary btn-sm"
                          >
                            collect
                          </button>
                        </td>
                      )}
                      <td>
                        <textarea
                          value={item?.samplemessage}
                          onChange={(ev) => {
                            handleSampleMessage(ev, item?.id);
                          }}
                          className="form-control"
                          type="text"
                          placeholder="type a message here"
                          disabled={item?.collection == true}
                        />{" "}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan={7}>
                    <button
                      onClick={(e) => collectAll()}
                      className={
                        allCollected
                          ? "btn btn-danger btn-sm"
                          : "btn btn-primary btn-sm"
                      }
                    >
                      {allCollected ? "unselect all" : "select all"}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          {loading && <ISLOADING />}
          {(!loading  && testcollection.length == 0)&& (
            <span className="d-flex justify-content-center align-items-center">
              <div>
                <svg className="text-danger"
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  fill="currentColor"
                  class="bi bi-cart-x"
                  viewBox="0 0 16 16"
                >
                  <path d="M7.354 5.646a.5.5 0 1 0-.708.708L7.793 7.5 6.646 8.646a.5.5 0 1 0 .708.708L8.5 8.207l1.146 1.147a.5.5 0 0 0 .708-.708L9.207 7.5l1.147-1.146a.5.5 0 0 0-.708-.708L8.5 6.793 7.354 5.646z" />
                  <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                </svg>
                <h4 style={{marginLeft:'-20px'}} className="my-2">No test Available</h4>
              </div>
            </span>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={(ev) => {
              setFullscreen(!fullscreen);
            }}
            className="btn btn-light text-secondary btn-sm mx-5"
          >
            fullscreen
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={(ev) => {
              handleSubmit();
            }}
          >
            save
          </button>
          <button className="btn btn-danger btn-sm" onClick={hide}>
            close
          </button>
        </Modal.Footer>
      </Modal>

    </>
  );
}
