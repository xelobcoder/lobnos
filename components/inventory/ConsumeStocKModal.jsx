import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { customData, customPost, handleResponse } from '../Auth/customFetch';

export default function ConsumeStocKModal({ data, setShow, show, update }) {
  const { stockid, stockname, departmentid, quantityAvailable } = data;
  const [stockLot, setStockLot] = useState([]);
  const [active, setActive] = useState(true);
  const [filteredBatch, setFilteredBatch] = useState({ data: [], batch: '', qty: '', selected: {} })
  const [qtyprovided, setQtyProvided] = useState(0);

  const getStockLot = async (stockid) => { await customData(`stock/department/consume/lot?stockid=${stockid}&&departmentid=${departmentid}`, setStockLot) };

  useEffect(() => {
    if (stockid && departmentid) { getStockLot(stockid); }
  }, [stockid, departmentid]);


  // this function will filter the lots array for lot brands and qty availble

  const getLotsBrandAndQty = async function (name) {
    const matched = stockLot.filter((item, index) => { return item.brand === name });
    setFilteredBatch({ ...filteredBatch, data: matched });
    setActive(false);
  }


  const handleBatch = async function (batchid) {
    setFilteredBatch({ ...filteredBatch, batch: batchid })
    const matched = filteredBatch.data.filter((item, index) => { return item.id == batchid });
    if (matched.length > 0) {
      setFilteredBatch({ ...filteredBatch, qty: matched[0]['quantity'], selected: matched[0] })
    }
  }

  const handleProvidedQtyNeeded = async (ev) => {
    const { value } = ev.target;
    if (parseInt(qtyprovided) > parseFloat(filteredBatch.qty)) {
      setQtyProvided(filteredBatch.qty)
    } else setQtyProvided(value);
  }


  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const { batchnumber, brand } = filteredBatch.selected;
    const data = { stockname, stockid, departmentid, consumeqty: qtyprovided, batchnumber, brand };

    const consumeResponse = await customPost(`departments/stock/consume`, 'POST', data);
    handleResponse(consumeResponse);
  }



  return (
    <>
      <Modal size='lg' show={show} onHide={setShow} style={{ zIndex: 9999}}>
        <Modal.Header  >
          <Modal.Title>
            <h4>Consume {stockname}</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            {/* stockname */}
            <div className='form-row'>
              <label>stock name</label>
              <input type='text' className='form-control' style={{ height: '50px' }} value={stockname} disabled required />
            </div>
            {/* qty available */}
            <div className='form-row'>
              <label>qty Available</label>
              <input type='text' className='form-control' style={{ height: '50px' }} disabled required value={quantityAvailable} />
            </div>
            {/* stockname  */}
            <div className='form-row'>
              <label>overal {stockname} Available</label>
              <input type='text' className='form-control' style={{ height: '50px' }} disabled required value={quantityAvailable} />
            </div>
            {/* brand */}
            <div className='form-row'>
              <label>brand</label>
              <select className='custom-select' onChange={(ev) => getLotsBrandAndQty(ev.target.value)}>
                <option>select brand </option>
                {stockLot.map((item, index) => {
                  return (
                    <option value={item.brand} key={index}>{item?.brand}</option>
                  )
                })}
              </select>
            </div>
            {/* batch number  and qty available */}
            <div className='form-row d-flex mt-2 gap-2'>
              <select disabled={active} className='custom-select' onChange={(ev) => { handleBatch(ev.target.value) }}>
                <option>select a batch number</option>
                {
                  filteredBatch.data.map((item, index) => {
                    return (
                      <option value={item.id} key={index}>{item.batchnumber}</option>
                    )
                  })
                }
              </select>
              <input value={filteredBatch.qty} disabled className='form-control' style={{ height: '50px' }} placeholder='qty of brand available' />
            </div>
            {/* qty to be consumed */}
            <div className='form-row'>
              <label>Qty to be consumed
                <span className='text-danger' style={{ fontSize: '12px' }} >  (Qty to be consumed must be less or equal to available brand with the selected batch number)</span>
              </label>
              <input value={qtyprovided} onChange={(ev) => { handleProvidedQtyNeeded(ev) }} type='text' className='form-control' style={{ height: '50px' }} required />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-start'>
          <div className='form-row mt-4'>
            <button onClick={(ev) => { handleSubmit(ev) }} type='submit' className='btn btn-warning'>consume</button>
          </div>
          <div className='form-row mt-4'>
            <button onClick={(ev) => {
              setActive(true);
              setFilteredBatch({ data: [], qty: '', batch: '' })
              setShow(false);
              window.scrollTo(0, 0)
            }} type='submit' className='btn btn-danger'>cancel</button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}
