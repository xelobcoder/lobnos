import React, { useState } from "react";
import { Modal } from "react-bootstrap";

const ReceiveLabSampleModal = ({ show, hide}) => {
  return (
    <>
      <Modal show={show}  backdrop='static' onHide={hide}>
        <Modal.Header       style={{ backgroundColor: "#e9ecef" }} closeButton>
          <Modal.Title>Receive sample</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* quality of sample */}
          <form>
            {/* quantity received */}
            <div className="form-group">
              <label htmlFor="quantity">Quantity received</label>
              <input
                type="text"
                className="custom-input"
                id="quantity"
                placeholder="Quantity received"
              />
            </div>
            {/* sample tube used */}
            <div className="form-group">
              <label htmlFor="sampleTube">Sample tube used</label>
              <select className="custom-select" id="sampleTube">
                <option>Choose...</option>
                <option value="gell tube">gell tube</option>
                <option value="plain tube">plain tube</option>
                <option value="EDTA tube">EDTA tube</option>
                <option value="sodium citrate tube">sodium citrate tube</option>
                <option value="fluoride tube">fluoride tube</option>
              </select>
            </div>
            {/* sample quality */}
            <div className="form-group">
              <label htmlFor="sampleQuality">Sample quality</label>
              <select className="custom-select" id="sampleQuality">
                <option>Choose...</option>
                <option value="good">good</option>
                <option value="fair">fair</option>
                <option value="poor">poor</option>
              </select>
            </div>
            {/* sample condition */}
            <div className="form-group">
              <label htmlFor="sampleCondition">Sample condition</label>
              <select className="custom-select" id="sampleCondition">
                <option>Choose...</option>
                <option value="good">good</option>
                <option value="fair">fair</option>
                <option value="poor">poor</option>
              </select>
            </div>
            {/* sample labelled */}
            <div className="form-group">
              <label htmlFor="sampleLabelled">Sample labelled</label>
              <select className="custom-select" id="sampleLabelled">
                <option>Choose...</option>
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </div>
            {/* received from */}
            <div>
              <label htmlFor="receivedFrom">Received from</label>
              <select className="custom-select" id="receivedFrom">
                <option>Choose...</option>
                <option value="organization">organization</option>
                <option value="ward">ward</option>
                <option value="clinic">clinic</option>
                <option value="clinician">clinician</option>
                <option value="other">other</option>
              </select>
            </div>
            {/* comments or remarks */}
            <div className="form-group">
              <label htmlFor="comments">Comments or remarks</label>
              <textarea
                className="form-control"
                id="comments"
                rows="3"
              ></textarea>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary btn-sm">Receive sample</button>
           <button className="btn btn-danger btn-sm" onClick={(ev) => {hide()}}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReceiveLabSampleModal;
