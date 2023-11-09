import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { customPost, handleChangeWithState } from '../Auth/customFetch';

export default function Application_Tax_Inclusion({ show, hide }) {
  const defaultx = { name: '', value: '' }
  const [tax, setTax] = useState(defaultx);

  const handleSubmit = async () => {
    if (tax.name && tax.value) {
      try {
        const pushResponse = await customPost('application/tax', 'POST', tax)
        const { status, statusCode, message } = pushResponse;
        if (status === 'success' && statusCode == 200) { setTax(defaultx); hide(); }
        alert(message);
      } catch (err) {
        console.log(err)
      }
    } else alert ('all fields required')
  }
  return (
    <Modal show={show}>
      <Modal.Header>
        <h4>Add new tax</h4>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className='form-row'>
            <label>Tax name</label>
            <input className='custom-input' onChange={(ev) => { handleChangeWithState(ev, 'name', setTax, tax) }} value={tax.name} placeholder='eg.VAT' type='text' />
          </div>
          <div className='form-row'>
            <label>Tax <span className='label-helper'>(All values should be in percentage)</span></label>
            <input type='number' placeholder='10%' onChange={(ev) => { handleChangeWithState(ev, 'value', setTax, tax) }} value={tax.value} className='custom-input' />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button type='button' onClick={handleSubmit} className='btn btn-success btn-sm mt-3'>
          save info
        </button>
        <button onClick={(ev) => { hide(); setTax(defaultx) }} type='button' className='btn btn-danger btn-sm mt-3'>
          cancel
        </button>
      </Modal.Footer>
    </Modal>
  )
}
