import { ArrowDropDown } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { customFetch, customPost } from "../Auth/customFetch";
import React, { useState, useEffect } from 'react';
import SAMPLE_REJECTION_MODAL_MESSAGE from "../samples/sampleRejectionModal";

export default function Accord({ data, removeClient }) {
  const [show, setShow] = useState(false);
  const [loadcount,setLoadingCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [sampleList, setSampleList] = useState([]);
  const [rejectionTarget, setRejectionTarget] = useState({ billingid: '', test: '', testid: "" })

  const getSampleList = async (billingid) => {
    let response = await customFetch(
      `phelobotomy/sample/assesment/list?billingid=${billingid}`
    );
    const { statusCode, status, result } = response;
    if (status == "success" && statusCode == 200) {
      setSampleList(result);
      setLoadingCount(loadcount+1)
    }
  };


  useEffect(() => {
    if (sampleList.length == 0 && loadcount != 0 ) {
      setShow(false);
      removeClient(data?.BILLINGID)
    }
  }, [sampleList])


  const showModalHandler = (e) => setShowModal(!showModal)

  const removeSampleInList = async function (item) {
    const _index = sampleList.filter((v, index) => { return item.testid != v.testid });
    setSampleList(_index)
  }

  // changes the status of the sample
  const approvalStatus = function (item, action) {
    // set completed to default
    const { billingid, testid, NAME } = item;
    // setCompleted(false);
    const forwardData = async function () {
      try {
        if (action == 'reject') {
          setShowModal(true);
          setRejectionTarget({ billingid, test: NAME, testid })
        } else {
          let response = await customPost(`sample`, 'PUT', { billingid, testid, action });
          const { statusCode, status, message } = response;
          if (statusCode == 200 && status == 'success') {
            // setCompleted(true)
            removeSampleInList(item)
          }
        }
      }
      catch (err) {
        alert('error occured in connecting to server')
      }
    }
    forwardData();
  }



  return (
    <>
      <div className="list-group-item ">
        <div className="first-row">
          <div className="accord-grid">
            <IconButton
              color="primary"
              style={{ backgroundColor: 'wheat' }}
              size="small"
              onClick={() => {
                setShow(!show)
                getSampleList(data.BILLINGID)
              }}
            >
              <ArrowDropDown />
            </IconButton>
            <h6>{data.BILLINGID}</h6>
            <h6>{data.DATE.slice(0, 10)}</h6>
            <div className="text-capitalize">{data.FULLNAME}</div>
          </div>
        </div>
        {show && (
          <div className="second-row">
            <div className="card br-5">
              <div className="card-header d-flex justify-content-between bg-secondary">
                <div>
                  {" "}
                  <h6>
                    <strong className="btn btn-danger">Sample list</strong>
                  </h6>
                </div>
                <div className="d-flex justify-content-end">
                  <div className="btn btn-warning">
                    pending count : {sampleList.length}
                  </div>
                </div>
              </div>
              <div className="card-body">
                {sampleList.map((item, index) => {
                  return (
                    <div key={index} className="grid-50 sample-list">
                      <div
                        className='accord-list-child'
                      >
                        <h6 style={{ fontWeight: '600' }}>{item.NAME}</h6>
                        <h6>{item.SAMPLE}</h6>
                        <h6>
                          <span className="bg-success text-white p-1 rounded">
                            {item.collection == "true" ? "collected" : ""}
                          </span>
                        </h6>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button className="btn  btn-sm btn-primary"
                          onClick={(e) => approvalStatus(item, 'accept')}
                        >
                          accept
                        </button>
                        <button
                          onClick={(e) => approvalStatus(item, 'reject')}
                          className="btn btn-sm btn-danger"
                          style={{ marginLeft: "10px" }}
                        >
                          reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              { }
            </div>
          </div>
        )}
      </div>
      <SAMPLE_REJECTION_MODAL_MESSAGE
        show={showModal}
        setShow={setShowModal}
        testid={rejectionTarget.testid}
        test={rejectionTarget.test}
        billingid={rejectionTarget.billingid}
      />
    </>
  );
}
