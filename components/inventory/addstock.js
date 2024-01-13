import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { customPost, getDataAndUpdateState } from '../Auth/customFetch';
import Modal from 'react-bootstrap/Modal';
import { Purchaseunitlist,Consumptionunitlist, defaultStockDetails, getShelves} from './Util';
export default function ADD_STOCK_INVENTORY({ show, closeModal, editing ,warehouseList = []}) {
  const { edit, stockid, data } = editing;
  const [shelves, setShelves] = useState([]);
  const [productdetails, setProductdetails] = useState(defaultStockDetails);
  const [Categorylist, setCategorylist] = useState([]);

  const inputhandler = (ev, field) => {
    let value = ev.target.value;
    setProductdetails((prev) => {
      return { ...prev, [field]: value }
    })
  }


  const handleSelectFields = (ev, target) => {
    const value = parseInt(ev.target.value);
    setProductdetails((prev) => {
      return { ...prev, [target]: value }
    })
    if (target === 'warehouse') {
      getShelves(value, setShelves);
    }
  }



  const handleSubmit = async (ev) => {
    try {
      ev.preventDefault();
  
      // Check if stockid is a valid number
      const providedstockid = parseInt(stockid);
      if (isNaN(providedstockid)) {
        throw new Error('Invalid stockid');
      }
  
      const method = edit === true ? 'PUT' : 'POST';
  
      // Check for empty fields in productdetails
      const hasEmptyFields = checkEmptyFields();
      if (hasEmptyFields) {
        toast.error('All fields are required', { autoClose: 3000 });
        return;
      }
  
      const refineddata = method === 'PUT' ? { ...productdetails, stockid: providedstockid } : productdetails;
  
      // Send data to the database
      const data = await customPost(`stock?stockid=${stockid}`, method, refineddata);
      const { status, message, statusCode } = data;
  
      if (status === 'success' && statusCode === 200) {
        toast.success(message, { autoClose: 500 });
      } else {
        toast.error(message, { autoClose: 3000 });
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred', { autoClose: 3000 });
    }
  };
  
  // Check for empty fields in productdetails
  const checkEmptyFields = () => {
    const notRequired = ['shelf', 'warehouse'];
    const isZeroAccepted = ['quantity', 'alertlevel'];
  
    for (let key in productdetails) {
      if (
        (productdetails[key] === '' || (productdetails[key] === 0 && !isZeroAccepted.includes(key))) &&
        !notRequired.includes(key)
      ) {
        return true;
      }
    }
  
    return false;
  };
  


  useEffect(() => {
    if (edit === true && stockid && data) {
      setProductdetails(data);
      getShelves(data?.warehouse, setShelves);
    }
  }, [edit, stockid,data])


  // get the category list
  const getcategorylist = async () => {
    getDataAndUpdateState(setCategorylist, "stock/category");
  }

  useEffect(() => {
    getcategorylist();
  }, [])


  const handleClose = () => {
    setProductdetails(defaultStockDetails);
    closeModal();
  }



  return (
    <>
      <ToastContainer />
      <div className="mx-3">
        <Modal show={show}  backdrop='static'>
          <Modal.Header closeButton onHide={handleClose}>
          {edit  === true ? "Update stock information" : "  New Stock Entry"}
          </Modal.Header>
          <Modal.Body>
          <form>
          <div className="form-group">
            <label className='text-sm' htmlFor="name">Name</label>
            <input
              type="text"
              className="custom-input"
              id="name"
              placeholder="Enter name"
              value={productdetails.name}
              onChange={(ev) => inputhandler(ev, "name")}
            />
          </div>

          <div className="form-group">
            <label className='text-sm' htmlFor="category">Category</label>
            <select
              className="custom-input"
              id="category"
              value={productdetails.category}
              onChange={(ev) =>  handleSelectFields(ev,'category')}
            >
              <option>Select category</option>;
              {Categorylist.map((item, index) => {
                return (
                  <option key={index} value={item.id}>
                    {item.category}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label className='text-sm' htmlFor="consumptionunit">Consumption Unit</label>
            <select
              className="custom-input"
              id="consumptionunit"
              value={productdetails.consumptionunit}
              onChange={(ev) => inputhandler(ev, "consumptionunit")}
            >
              <option value="">Select consumption unit</option>
              {Consumptionunitlist.map((item, index) => {
                return (
                  <option key={index} value={item}>
                    {item}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label className='text-sm' htmlFor="purchaseunit">Purchase Unit</label>
            <select
              className="custom-input"
              id="purchaseunit"
              value={productdetails.purchaseunit}
              onChange={(ev) => inputhandler(ev, "purchaseunit")}
            >
              <option value="">Select purchase unit</option>
              {Purchaseunitlist.map((item, index) => {
                return (
                  <option key={index} value={item}>
                    {item}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label className='text-sm' htmlFor="quantity">Unit Quantity</label>
            <input
              type="text"
              className="custom-input"
              id="quantity"
              placeholder="Enter unit quantity"
                  value={productdetails.quantity}
              disabled={edit}
              onChange={(ev) => inputhandler(ev, "quantity")}
            />
          </div>

          <div className="form-group">
            <label className='text-sm' htmlFor="alertlevel">Alert Level</label>
            <input
              type="text"
              className="custom-input"
              id="alertlevel"
              placeholder="Enter alert level"
              value={productdetails.alertlevel}
              onChange={(ev) => inputhandler(ev, "alertlevel")}
            />
          </div>

          <div className="form-group">
            <label className='text-sm' htmlFor="materialcode">Material Code</label>
            <input
              type="text"
              className="custom-input"
              id="materialcode"
              placeholder="Enter material code"
              value={productdetails.materialcode}
              onChange={(ev) => inputhandler(ev, "materialcode")}
            />
          </div>
          <div className="form-group">
            <label className='text-sm' htmlFor="materialcode">WareHouse</label>
                <select
                  className="custom-select"
                  id="warehouse"
                  value={productdetails.warehouse}
                 onChange={(ev) => {handleSelectFields(ev, "warehouse")}}
                >
                  <option>select Warehouse</option>
                  {
                    warehouseList.map((item, index) => {
                      return (
                        <option value={item?.id} key={index}>{item?.name}</option>
                      )
                    })
                 } 
              </select>
          </div>
          <div className="form-group">
            <label className='text-sm' htmlFor="materialcode">Shelf</label>
            <select
                    className='custom-select' id='shelf' value={productdetails.shelf} onChange={(ev) => { handleSelectFields(ev, 'shelf') }} name='shelf'>
              <option>select shelf/racks of the selected warehouse</option>
              {
                shelves.map((item, index) => {
                  return (
                    <option value={item?.id} key={index}>
                      {item?.name}
                    </option>
                  )
                })
              }
                  </select>
            </div>
        </form>
          </Modal.Body>
          <Modal.Footer>
              <div className="form-group mx-3">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    onClick={handleSubmit}
                  >
                    {edit  === true ? "Update stock information" : "Add new stock"}
              </button>
              <button onClick={handleClose} className='btn btn-danger btn-sm mx-2'>
                cancel
              </button>
              </div>
          </Modal.Footer>
       </Modal>
        
      </div>
    </>
  );
}
