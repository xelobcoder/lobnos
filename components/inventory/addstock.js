import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import { SystemUpdate, AddCircleOutline, Info } from '@mui/icons-material';
import { customFetch, customPost } from '../Auth/customFetch';
import { Button } from '@mui/material';

export default function ADD_STOCK_INVENTORY() {
  // iinput fields = name, category, consumption unit,purchase unit, material code,unit quantity,alert level,tax
  const [productdetails, setProductdetails] = useState({
    name: '',
    category: '',
    consumptionunit: '',
    purchaseunit: '',
    quantity: '',
    alertlevel: '',
    materialcode: '',
  })

  const [show, setMessageshow] = useState(false);
  const [message, setMessage] = useState({ type: 'success', message: '' })


  const tab = useRouter().query.tab;
  const stockid = useRouter().query.stockid;


  const [Categorylist, setCategorylist] = useState([])
  const [Consumptionunitlist, setConsumptionunitlist] = useState(['kg', 'g', 'l', 'ml', 'pcs', 'others', 'bottle', 'kit', 'box'])
  const [Purchaseunitlist, setPurchaseunitlist] = useState(['kg', 'g', 'l', 'ml', 'pcs', 'others', 'bottle', 'kit', 'box'])


  const { name, category, consumptionunit, purchaseunit, quantity, alertlevel, materialcode, tax } = productdetails;

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
        const { status, message } = data;
        if (status === 'success') {
          setMessageshow(true);
          setMessage({ type: 'success', message: message })
        }
        else {
          setMessageshow(true);
          setMessage({ type: 'warning', message: message })
        }
      }

      // if product details have no value
      const checkEmptyFields = () => {
        let emptyFields = [];
        for (let key in productdetails) {
          if (productdetails[key] === '') {
            emptyFields.push(key);
          }
        }
        return emptyFields.length > 0 ? true : false;
      }

      if (checkEmptyFields()) {
        setMessageshow(true);
        setMessage({ type: "warning", message: "Please fill all fields" });
      }
      else {
        senddata();
      }
    }
    catch (error) {
      setMessageshow(true);
      // setMessage({ type: 'danger', message: error?.message })
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
    const data = await customFetch('stock/category');
    setCategorylist(data);
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
      <div className="mt-3 p-3">
        <div className='alert alert-info' style={{ width: '400px' }}>
          <h6>kindly fill in all fields to {tab == 'edit' ? 'update stock information' : ' add a new stock '}</h6>
        </div>
        <form
          className='grid-50-responsive p-3' id='registration'
        >
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Enter name"
              value={name}
              onChange={(ev) => inputhandler(ev, "name")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              className="form-control"
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
              className="form-control"
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
              className="form-control"
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
              className="form-control"
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
              className="form-control"
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
              className="form-control"
              id="materialcode"
              placeholder="Enter material code"
              value={materialcode}
              onChange={(ev) => inputhandler(ev, "materialcode")}
            />
          </div>
        </form>
        <div className="form-group mt-3">
          <button
            type="submit"
            className="btn btn-primary"
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
