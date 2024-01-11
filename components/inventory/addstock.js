import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { SystemUpdate, AddCircleOutline } from '@mui/icons-material';
import { customFetch, customPost, getDataAndUpdateState } from '../Auth/customFetch';


export default function ADD_STOCK_INVENTORY() {
  const [productdetails, setProductdetails] = useState({
    name: '',
    category: '',
    consumptionunit: '',
    purchaseunit: '',
    quantity: '',
    alertlevel: '',
    materialcode: '',
    warehouse: '',
    shelf: ''
  })
  const [Categorylist, setCategorylist] = useState([]);


  const tab = useSearchParams().get("tab");
  const stockid = useSearchParams().get("stockid");
  const Consumptionunitlist = ['kg', 'g', 'l', 'ml', 'pcs', 'others', 'bottle', 'kit', 'box']
  const Purchaseunitlist = ['kg', 'g', 'l', 'ml', 'pcs', 'others', 'bottle', 'kit', 'box']


  const { name, category, consumptionunit, purchaseunit, quantity, alertlevel, materialcode, tax ,warehouse,shelf} = productdetails;

  const inputhandler = (ev, field) => {
    let value = ev.target.value;
    setProductdetails((prev) => {
      return { ...prev, [field]: value }
    })
  }




  const handleSubmit = (ev) => {
    ev.preventDefault();
    // send data to the db
    const method = tab === 'edit' ? 'PUT' : 'POST';
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

  // this get the data of item to edit
  const getdata = async () => {
    const data = await customFetch(`stock?stockid=${stockid}`)
    const { status, message, result } = data;
    if (status === 'success') {
      setProductdetails(result[0]);
    }
  }
  // use Memo to get the data of item to edit
  useEffect(() => {
    if (tab === 'edit' && stockid) {
      // get data from db and set to the input fields
      getdata();
    }
  }, [tab, stockid])


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
      alert('error getting category list')
    }
  }, [])





  return (
    <>
      <ToastContainer/>
      <div className="mx-3">
        <form
          className='grid-50-responsive p-3'>
          <div className="form-group">
            <label htmlFor="name">Name</label>
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
            <label htmlFor="category">Category</label>
            <select
              className="custom-input"
              id="category"
              value={category}
              onChange={(ev) => inputhandler(ev, "category")}
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
            <label htmlFor="consumptionunit">Consumption Unit</label>
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
            <label htmlFor="purchaseunit">Purchase Unit</label>
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
            <label htmlFor="quantity">Unit Quantity</label>
            <input
              type="text"
              className="custom-input"
              id="quantity"
              placeholder="Enter unit quantity"
              value={quantity}
              onChange={(ev) => inputhandler(ev, "quantity")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="alertlevel">Alert Level</label>
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
            <label htmlFor="materialcode">Material Code</label>
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
            <label htmlFor="materialcode">WareHouse</label>
            <input
              type="text"
              className="custom-input"
              id="warehouse"
              placeholder="Enter  warehouse name"
              value={warehouse}
              onChange={(ev) => inputhandler(ev, "warehouse")}
            />
          </div>
          <div className="form-group">
            <label htmlFor="materialcode">Shelf</label>
            <input
              type="text"
              className="custom-input"
              id="shelf"
              placeholder="Enter shelf"
              value={shelf}
              onChange={(ev) => inputhandler(ev, "shelf")}
            />
          </div>
        </form>
        <div className="form-group mx-3">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
          >
            {tab === "edit" ? <SystemUpdate /> : <AddCircleOutline />}
            {tab === "edit" ? "Update stock information" : "Add new stock"}
          </button>
        </div>
      </div>
    </>
  );
}
