import React, { useState } from "react";
import { Modal} from "react-bootstrap";

const RejectionMessageModalDialogJsx = ({ show, hide, message,handleDisputed,id }) => {
  const [dispute, setDispute] = useState(false);
  const [reason, setReason] = useState("");


  const clearDispute = () => {
    setDispute(false);
    setReason("");
  }

  return (
    <>
      <Modal show={show} onHide={hide} backdrop="static">
        <Modal.Header>
          <Modal.Title className="d-flex justify-content-between">
            <span>Rejection Reason</span>
          </Modal.Title>
          <button className="btn btn-sm btn-primary align-self-end"  
           onClick={(ev) => {setDispute(true)}}>
            Dispute rejection
          </button>
        </Modal.Header>
        <Modal.Body>
          <p className="alert alert-danger">{message}</p>
          {dispute && (
            <div className="mt-2">
              {/* reason for dispute */}
              <div className="form-group">
                <label htmlFor="reason">Reason for dispute</label>
                <textarea
                  value={reason}
                  onChange={(ev) => {
                    setReason(ev.target.value);
                  }}
                  className="form-control"
                  id="reason"
                  rows="3"
                ></textarea>
              </div>
              {/* dispute */}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary btn-sm" onClick={(ev) => {handleDisputed(id,reason); clearDispute();}}>
            Save
          </button>
          <button className="btn btn-danger btn-sm" onClick={(ev) => {clearDispute(); hide()}}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RejectionMessageModalDialogJsx;
