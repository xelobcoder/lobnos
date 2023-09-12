import React from 'react';
import { Modal } from 'react-bootstrap'

export default function SnapClinicianModal({show,close,title,component}) {
  return (
    <>
      <Modal show={show} className='mt-5 mb-5' animation={true} backdrop="static" size='lg'>
        <Modal.Header className='bg-success text-white d-flex p-4 alighn-center text-capitalize'>
          <h5>{title}</h5>
        </Modal.Header>
        <Modal.Body>
        {component}
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-danger' onClick={(e) => {close()}}>
            close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
