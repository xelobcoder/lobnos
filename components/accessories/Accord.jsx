import { ArrowDropDown } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { customFetch } from "../Auth/customFetch";
import React, { useState, useEffect } from 'react';

export default function Accord({ data ,statusHandler}) {
  const [show, setShow] = useState(false);

  const [sampleList, setSampleList] = useState([])

  const getSampleList = async (billingid) => {
    let response = await customFetch(
      `phelobotomy/sample/assesment/list?billingid=${billingid}`
    );
    const { statusCode, status, result } = response;
    console.log(result);
    if (status == "success" && statusCode == 200) {
      setSampleList(result);
    }
  };

  

  return (
    <>
      <div className="list-group-item ">
        <div className="first-row">
          <div className="accord-grid">
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                setShow(!show)
                getSampleList(data.BILLINGID)
              }}
            >
              <ArrowDropDown />
            </IconButton>
            <h6>{data.FULLNAME}</h6>
            <div>
              <span className="badge bg-warning p-2 rounded-pill">
                {data.SAMPLE_STATUS}
              </span>
            </div>
            <h6>{data.BILLINGID}</h6>
            <h6>{data.DATE.slice(0, 10)}</h6>
          </div>
        </div>
        {show && (
          <div className="second-row">
            <div className="card rounded">
              <div className="card-header d-flex justify-content-between">
                <div>
                  {" "}
                  <h6>
                    <strong className="btn btn-danger">Sample list</strong>
                  </h6>
                </div>
                {/* <div >
                <button className="btn btn-sm btn-primary">accept all</button>
                <button className="btn btn-sm btn-danger" style={{ marginLeft: '10px' }}>reject all</button>
              </div> */}
              </div>
              <div className="card-body">
                {sampleList.map((item, index) => {
                  return (
                    <div key={index} className="grid-50 sample-list">
                      <div
                        className='accord-list-child'
                      >
                        <h6 style={{fontWeight:'600'}}>{item.NAME}</h6>
                        <h6>{item.SAMPLE}</h6>
                        <h6>
                          <span className="bg-success text-white p-1 rounded">
                            {item.collection == "true" ? "collected" : ""}
                          </span>
                        </h6>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button className="btn btn-sm btn-primary"
                        onClick={(e)=>statusHandler(item,'accept')}
                        >
                          accept
                        </button>
                        <button
                         onClick={(e)=>statusHandler(item,'reject')}
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}
