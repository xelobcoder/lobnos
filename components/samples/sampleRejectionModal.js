import React, { useState } from 'react';
import { TextField } from '@mui/material';
import Modal from 'react-bootstrap/Modal';
import { customPost } from '../Auth/customFetch';

function SAMPLE_REJECTION_MODAL_MESSAGE({ show, setShow, billingid, test, testid }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [modalDetails, setModalDetails] = useState({
    billingid,
    action: 'reject',
    message: '',
    testid,
    test
  });

  const handleSubmit = async (e) => {
    // SEND TO BACKEND
    const response = await customPost('sample', 'PUT', modalDetails)
    const { statusCode, status, message } = response;
    if (statusCode == 200 && status == 'success') {
      alert(message)
    }
  }



  return (
    <>
      <div>
        <Modal show={show} style={{ position: 'absolute', top: '10%' }} fullscreen={fullscreen} onHide={() => setShow(false)}>
          <Modal.Header closeButton className='bg-secondary text-white'>
            <Modal.Title>
              <h6>Sample Rejection for {test} of client with billingid {billingid} </h6>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TextField label='type in reason for rejection of sample' sx={{ width: '100%' }} maxRows={10} multiline variant='outlined' minRows={6}
              onChange={(e) => { setModalDetails({ ...modalDetails, message: e.target.value, billingid: billingid, testid, test }) }}
            >

            </TextField>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-primary' onClick={(e) => {
              handleSubmit(e);
              setShow(false);
            }}>append message</button>
            <button className="btn btn-warning" onClick={() => setFullscreen(!fullscreen)}>
              Toggle fullscreen
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}



export default SAMPLE_REJECTION_MODAL_MESSAGE;