import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { SystemUpdate, AddCircleOutline } from '@mui/icons-material';
import { customFetch, customPost, getDataAndUpdateState } from '../Auth/customFetch';
import Modal from 'react-bootstrap/Modal';
import { Purchaseunitlist,Consumptionunitlist, defaultStockDetails, getShelves } from './Util';
export default function ADD_STOCK_INVENTORY({ show, closeModal, editing ,warehouseList = []}) {
  const { edit, stockid, data } = editing;
  const [shelves, setShelves] = useState([]);
  const [productdetails, setProductdetails] = useState(defaultStockDetails);
  const { name,  consumptionunit, purchaseunit, quantity, alertlevel, materialcode, warehouse,shelf} = productdetails;
  const [Categorylist, setCategorylist] = useState([]);

  const inputhandler = (ev, field) => {
    let value = ev.target.value;
    setProductdetails((prev) => {
      return { ...prev, [field]: value }
    })
  }

  const handleSelectFields = (ev, target) => {
    const value = parseInt(ev.target.value);

    if (target === 'category') {
      const matchedId = Categorylist.filter((item, index) => { return item.id === value });
      if (matchedId.length != 0) {
        const { category } = matchedId[0];
        setProductdetails({ ...productdetails, category, categoryid: value });
      }
    }
    if (target === 'warehouse') {
      const matchedId = warehouseList.filter((item, index) => { return item.id === value });
      if (matchedId.length != 0) {
        const { name } = matchedId[0];
        setProductdetails({ ...productdetails, warehouse: name, warehouseid: value });
        getShelves( value, setShelves);
      }
    }
    if (target === "shelf") {
      const { warehouseid } = productdetails;
      const parsedWarehouseid = parseInt(warehouseid);
      if (!parsedWarehouseid && typeof parseInt(parsedWarehouseid) != 'number') { return false };
      const matchedId = shelves.filter((item, index) => { return item.id === value });
      if (matchedId.length != 0) {
        const { name } = matchedId[0];
        setProductdetails({ ...productdetails, shelf: name, shelfid: value });
      }
    } 
  }



  const handleSubmit = (ev) => {
    ev.preventDefault();
    // send data to the db
    const method = edit === true ? 'PUT' : 'POST';
    try {
      const senddata = async () => {
        const data = await customPost(`stock?stockid=${stockid}`, method, productdetails);
        const { status, message,statusCode } = data;
        if (status === 'success' && statusCode == 200) {
          toast.success(message, { autoClose: 500 });
          return;
        }
        toast.error(message, { autoClose: 3000 });
      }

      // if product details have no value
      const checkEmptyFields = () => {
        let emptyFields = [];
        const notRequired = ['shelf', 'warehouse'];
        for (let key in productdetails) {
          if (productdetails[key] === '' && !notRequired.includes(key) ) {
            emptyFields.push(key);
            break;
          }
        }
        return emptyFields.length > 0 ? true : false;
      }

      if (checkEmptyFields()) {
        toast.error('All fields are required', { autoClose: 3000 });
      }
      else {
        senddata();
      }
    }
    catch (error) {
      toast.error(error, { autoClose: 3000 });
    }
  }


  // use Memo to get the data of item to edit
  useEffect(() => {
    if (edit === true && stockid && data) {
      setProductdetails(data);
    }
  }, [edit, stockid,data])


  // get the category list
  const getcategorylist = async () => {
    getDataAndUpdateState(setCategorylist, "stock/category");
  }

  useEffect(() => {
    try {
      getcategorylist();
    }
    catch (error) {
      setCategorylist([]);
    }
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
              value={name}
              onChange={(ev) => inputhandler(ev, "name")}
            />
          </div>

          <div className="form-group">
            <label className='text-sm' htmlFor="category">Category</label>
            <select
              className="custom-input"
              id="category"
              // value={category}
              onChange={(ev) =>  handleSelectFields(ev,'category')}
            >
              <option value="">Select category</option>
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
              value={consumptionunit}
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
              value={purchaseunit}
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
                  value={quantity}
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
              value={alertlevel}
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
              value={materialcode}
              onChange={(ev) => inputhandler(ev, "materialcode")}
            />
          </div>
          <div className="form-group">
            <label className='text-sm' htmlFor="materialcode">WareHouse</label>
                <select
                  className="custom-select"
                  id="warehouse"
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
                {edit === true
                  ?
              ( <select className='custom-select' id='shelf' onChange={(ev) => {handleSelectFields(ev,'shelf')}} name='shelf'>
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
                  </select>)
                  :
                  (
                    <input onChange={(ev) => { inputhandler(ev, 'shelf'); }} className='custom-input' type='input' name='shelf' value={productdetails.shelf}/>
            )}
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
