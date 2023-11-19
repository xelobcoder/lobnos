import React, { useState, useEffect, useCallback } from "react";
import ISLOADING from "../../components/isLoading";
import { toast, ToastContainer } from 'react-toastify';
import { customPost, getDataAndUpdateState } from "../../components/Auth/customFetch";
import RejectionMessageModalDialogJsx from "../../components/samples/RejectionMessageModalDialogJsx/RejectionMessageModalDialogJsx";

export default function RejectedSamplesComponent() {
  const [data, setData] = useState([]);
  const [viewRejection, setViewRejection] = useState({ status: false, message: '', id: '' });
  const [loading, setLoading] = useState(true);
  const fetchInitialData = useCallback(async function () { getDataAndUpdateState(setData, 'rejected') }, [])

  useEffect(() => { fetchInitialData(); setLoading(false); }, [fetchInitialData])

  const handleClose = () => { setViewRejection({ status: false, message: '', id: '' }); }


  const removeClient = (id) => {
    setData((prev) => {
      return prev.filter((item, index) => index !== id);
    })
  }

  const handleDisputed = async (id, reason) => {
    // id refers to index of the data array
    // filter the data array to get the billingid
    const filtered = data[id];

    const { billingid, testid } = filtered;

    const body = { billingid, testid, disputedby: 1, disputedon: new Date(), disputereason: reason };

    const response = await customPost(`sample/rejection/disputed`, 'PUT', body);
    const { status, statusCode, message } = response;
    if (statusCode == 200 && status == 'success') {
      toast.success(message);
      removeClient(id);
      handleClose();
    } else {
      toast.error(message);
    }
  }


  return (
    <>
      <ToastContainer />
      <div className="mx-3">
        {(loading && data.length == 0) && <ISLOADING />}
        <h5 className="text-primary">Rejected Samples</h5>
        <div className="list-group" style={{ overflowx: "auto", cursor: 'pointer' }}>
          <div className="list-group-item list-group-item-dark text-capitalize" style={{ display: 'grid', gridTemplateColumns: '10% 15% 20% 20% 10% 10% 10%' }}>
            <span>collection date</span>
            <span>fullname</span>
            <span>brief details</span>
            <span>test</span>
            <span>validated on</span>
            <span>validated by</span>
            <span>action</span>
          </div>
          {data.length > 0 && data.map((item, index) => {
            return (
              <div key={index} className="list-group-item list-group-item-action text-capitalize" style={{ display: 'grid', gridTemplateColumns: '10% 15% 20% 20% 10% 10% 10%', fontSize: 14 }}>
                <span>{new Date(item?.collection_date).toLocaleDateString()}</span>
                <span>{item?.fullname}</span>
                <span className="text-wrap">
                  {item?.age},{item?.gender},{item?.mobilenumber}
                </span>
                <div>
                  <span className="badge rounde-pill text-bg-danger">{item?.name}</span>
                </div>
                <span>{new Date(item?.samplevalidatedon).toLocaleDateString()}</span>
                <span>{item?.validatedby}</span>
                <span>
                  <button className="btn btn-sm btn-secondary"
                    onClick={() => { setViewRejection({ status: true, message: item?.rejectionmessage, id: index }); }}>
                    view
                  </button>
                  <button className="btn btn-sm btn-warning mx-1">redraw</button>
                </span>
              </div>
            )
          })}
          {(!loading && data.length == 0) && <div className="text-center list-group-item ">
            <h3>Oops! No data</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" class="bi bi-cart-x" viewBox="0 0 16 16">
              <path d="M7.354 5.646a.5.5 0 1 0-.708.708L7.793 7.5 6.646 8.646a.5.5 0 1 0 .708.708L8.5 8.207l1.146 1.147a.5.5 0 0 0 .708-.708L9.207 7.5l1.147-1.146a.5.5 0 0 0-.708-.708L8.5 6.793 7.354 5.646z" />
              <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
            </svg>
          </div>}
        </div>
      </div>
      <RejectionMessageModalDialogJsx handleDisputed={handleDisputed} id={viewRejection.id} message={viewRejection.message} show={viewRejection.status} hide={handleClose} />
    </>
  )
}