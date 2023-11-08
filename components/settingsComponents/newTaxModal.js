import React from 'react'
import { Modal } from 'react-bootstrap'

export default function Application_Tax_Inclusion() {
  return (
    <Modal show>
      <Modal.Header>
        <h4>Add new tax</h4>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className='form-row'>
            <label>Tax name</label>
            <input className='custom-input' placeholder='eg.VAT' type='text' />
          </div>
          <div className='form-row'>
            <label>Tax <span className='label-helper'>(All values should be in percentage)</span></label>
            <input type='number' placeholder='10%' className='custom-input' />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button type='button' className='btn btn-success btn-sm mt-3'>
          save info
        </button>
        <button type='button' className='btn btn-danger btn-sm mt-3'>
          cancel
        </button>
      </Modal.Footer>
    </Modal>
  )
}
