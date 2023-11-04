import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import ReadyTest from './ReadyTest'
import { Forward } from '@mui/icons-material';

export default function PrintModalReady({ display, active, hide }) {
  return (
    <Modal show={display}>
      <Modal.Header className='bg-secondary text-white' >
        BillingID <Forward /> {active}
      </Modal.Header>
      <Modal.Body className='p-0'>
        <ReadyTest id={active} />
      </Modal.Body>
      <Modal.Footer>
        <button onClick={(ev) => { hide() }} className='btn btn-danger btn-sm'>close</button>
      </Modal.Footer>
    </Modal>
  )
}
