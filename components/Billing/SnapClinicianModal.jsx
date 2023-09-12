import React from 'react';
import { Modal } from 'react-bootstrap'

export default function SnapClinicianModal({ show, close, title, children }) {
  return (
    <>
      <Modal show={show} className='mt-5 mb-5' animation={true} backdrop="static" size='lg'>
        <Modal.Header className='capitalize text-cyan-300 first-letter:uppercase bg-orange-500 '>
          <h5>{title}</h5>
        </Modal.Header>
        <Modal.Body>
          {children}
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-danger' onClick={(e) => { close() }}>
            close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
