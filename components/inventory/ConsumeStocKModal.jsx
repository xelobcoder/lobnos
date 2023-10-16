import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { customData } from '../Auth/customFetch';

export default function ConsumeStocKModal({ data, setShow, show, update }) {
  const { stockid, stockname, departmentid, quantityAvailable } = data;
  const [stockLot, setStockLot] = useState([]);

  const getStockLot = async (stockid) => { await customData(`stock/department/consume/lot?stockid=${stockid}&&departmentid=${departmentid}`, setStockLot) };

  useEffect(() => {
    if (stockid && departmentid) { getStockLot(stockid); }
  }, [stockid, departmentid]);

  return (
    <>
      <Modal size='lg' show={show} onHide={setShow} style={{ zIndex: 9999, position: 'absolute', top: '11%' }}>
        <Modal.Header closeButton >
          <Modal.Title>
            <h4>Consume {stockname}</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            {/* stockname */}
            <div className='form-row'>
              <label>stock name</label>
              <input type='text' className='custom-input' value={stockname} disabled required />
            </div>
            {/* qty available */}
            <div className='form-row'>
              <label>qty Available</label>
              <input type='text' className='custom-input' disabled required value={quantityAvailable} />
            </div>

            <div className='form-row'>
              <label>qty Available</label>
              <input type='text' className='custom-input' disabled required value={quantityAvailable} />
            </div>
            {/* qty to be consumed */}
            <div className='form-row'>
              <label>Qty to be consumed
                <span className='text-danger' style={{ fontSize: '12px' }} >  (qty should be less or equal to qty available)</span>
              </label>
              <input value={data.quantity} onChange={(ev) => { update(ev.target.value) }} type='text' className='custom-input' required />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-start'>
          <div className='form-row mt-4'>
            <button type='submit' className='btn btn-warning'>consume</button>
          </div>
          <div className='form-row mt-4'>
            <button onClick={(ev) => { setShow(false) }} type='submit' className='btn btn-danger'>cancel</button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}
