import React, { useState, useEffect,useMemo } from 'react';
import { useRouter } from 'next/router';
import TopMessage from '../accessories/TopMessage';
import { SystemUpdate, AddCircleOutline } from '@mui/icons-material';

export default function ADD_STOCK_INVENTORY() {
 // iinput fields = name, category, consumption unit,purchase unit, material code,unit quantity,alert level,tax
 const [productdetails, setProductdetails] = useState({
  name: '',
  category: '',
  consumptionunit: '',
  purchaseunit: '',
  unitquantity: '',
  alertlevel: '',
  materialcode: '',
  tax: ''
 })

 const [show, setMessageshow] = useState(false);
 const [message, setMessage] = useState({ type: 'success', message: '' })


 const tab = useRouter().query.tab;
 const stockid = useRouter().query.stockid;


 const [Categorylist, setCategorylist] = useState(['consumables', 'real estate', 'equipment', 'furniture', 'vehicles', 'others'])
 const [Consumptionunitlist, setConsumptionunitlist] = useState(['kg', 'g', 'l', 'ml', 'pcs', 'others','bottle','kit','box'])
 const [Purchaseunitlist, setPurchaseunitlist] = useState(['kg', 'g', 'l', 'ml', 'pcs', 'others','bottle','kit','box'])


 const { name, category, consumptionunit, purchaseunit, unitquantity, alertlevel, materialcode, tax } = productdetails;

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
    const response = await fetch(tab == 'edit' ? `http://localhost:5000/api/v1/stock?stockid=${stockid}` :
     'http://localhost:5000/api/v1/stock', {
     method,
     headers: {
      'Content-Type': 'application/json'
     },
     body: JSON.stringify(productdetails)
    })
    const data = await response.json();
    console.log(data);
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
    setMessage({ type: 'warning', message: 'Please fill all fields' })
   }
   else {
    senddata();
   }
  }
  catch (error) {
   setMessageshow(true);
   setMessage({ type: 'danger', message: error.message })
  }
 }


 // use Memo to get the data of item to edit
 useMemo(() => {
  console.log(tab,stockid)
 }, [tab, stockid])





 return (
  <>
   {
    show &&
    <TopMessage display={show} message={message.message} type={message.type} messageTimer={
     () => {
      setTimeout(() => {
       setMessageshow(false);
      }, 3000)
     }
    } />
   }
   <div id='addsupplier' className='mt-3'>
    <form style={{ display: 'grid', gridTemplateColumns: '48% 48%', gridGap: '0px 1%' }}>
     <div className="form-group">
      <label htmlFor="name">Name</label>
      <input type="text" className="custom-input" id="name" placeholder="Enter name" value={name} onChange={(ev) => inputhandler(ev, 'name')} />
     </div>

     <div className="form-group">
      <label htmlFor="category">Category</label>
      <select className="custom-input" id="category" value={category} onChange={(ev) => inputhandler(ev, 'category')}>
       <option value="">Select category</option>
       {Categorylist.map((item, index) => {
        return <option key={index} value={item}>{item}</option>;
       })}
      </select>
     </div>

     <div className="form-group">
      <label htmlFor="consumptionunit">Consumption Unit</label>
      <select className="custom-input" id="consumptionunit" value={consumptionunit} onChange={(ev) => inputhandler(ev, 'consumptionunit')}>
       <option value="">Select consumption unit</option>
       {Consumptionunitlist.map((item, index) => {
        return <option key={index} value={item}>{item}</option>;
       })}
      </select>
     </div>

     <div className="form-group">
      <label htmlFor="purchaseunit">Purchase Unit</label>
      <select className="custom-input" id="purchaseunit" value={purchaseunit} onChange={(ev) => inputhandler(ev, 'purchaseunit')}>
       <option value="">Select purchase unit</option>
       {Purchaseunitlist.map((item, index) => {
        return <option key={index} value={item}>{item}</option>;
       })}
      </select>
     </div>

     <div className="form-group">
      <label htmlFor="unitquantity">Unit Quantity</label>
      <input type="text" className="custom-input" id="unitquantity" placeholder="Enter unit quantity" value={unitquantity} onChange={(ev) => inputhandler(ev, 'unitquantity')} />
     </div>

     <div className="form-group">
      <label htmlFor="alertlevel">Alert Level</label>
      <input type="text" className="custom-input" id="alertlevel" placeholder="Enter alert level" value={alertlevel} onChange={(ev) => inputhandler(ev, 'alertlevel')} />
     </div>

     <div className="form-group">
      <label htmlFor="materialcode">Material Code</label>
      <input type="text" className="custom-input" id="materialcode" placeholder="Enter material code" value={materialcode} onChange={(ev) => inputhandler(ev, 'materialcode')} />
     </div>

     <div className="form-group">
      <label htmlFor="tax">Tax</label>
      <input type="text" className="custom-input" id="tax" placeholder="Enter tax" value={tax} onChange={(ev) => inputhandler(ev, 'tax')} />
     </div>

     <div className="form-group">
      <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
       {tab === 'edit' ? <SystemUpdate /> : <AddCircleOutline />}
       {tab === 'edit' ? 'Update' : 'Add'}
      </button>
     </div>
    </form>
   </div></>
 )
}
