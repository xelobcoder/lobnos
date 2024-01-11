import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { regions, defaultSupplierdata,getDataAndUpdateState } from '../Auth/customFetch';
import { ToastContainer ,toast} from "react-toastify";
import { pushNewSupplierInformation } from './util';
import ISLOADING from "../isLoading";

export default function ADD_NEW_SUPPLIER() {
  const tab = useSearchParams().get("tab");
  const [loading, setLoading] = useState(false);
  const supplierid = useSearchParams().get("supplierid");

  const [newsupplier, setNewSupplier] = useState(defaultSupplierdata);
  const { name, address, email, phonenumber, region, contactperson } = newsupplier;
  const inputhandler = (ev, field) => {
    let value = ev.target.value;setNewSupplier((prev) => {
      return { ...prev, [field]: value }
    })
  }


  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const method = tab === 'edit' ? 'PUT' : 'POST';
    if (tab === 'edit' && !supplierid) return false;
    let outcome = await pushNewSupplierInformation(method, newsupplier, toast, supplierid);
    outcome && setNewSupplier(defaultSupplierdata);
  }





  useEffect(() => {
    if (tab === 'edit' && supplierid) {
      setLoading(true);
      getDataAndUpdateState(setNewSupplier, `suppliers?supplierid=${supplierid}`, true)
        .then((data) => { setNewSupplier(data[0]) })
        .catch((err) => { toast.error("something wrong occured", { autoClose: 3000 }) });
      setLoading(false);
    }
  }, [tab, supplierid])

  return (
    <>
      <ToastContainer/>
      <div className='p-2'>
        {
          loading ? 
            <ISLOADING />
            :
            (
              <div className='card bg-white br-0'>
              <div className="card-header">
                 <div className='fw-bold card-title'> {tab === 'edit' ? 'Update supplier information' : 'Add New supplier'}</div>
              </div>
              <div className='card-body'>
              <form>
                <div className='form-group'>
                  <label className='my-1' htmlFor='name'>Name</label>
                  <input className='custom-input' value={name} list='customers' name='name' placeholder='supplier name'
                    onChange={(ev) => inputhandler(ev, 'name')} />
    
                </div>
    
                <div className='form-group'>
                  <label className='my-1' htmlFor='address'>Address</label>
                  <input className='custom-input' id='addx' value={address}
                    onChange={(ev) => inputhandler(ev, 'address')}
                    placeholder='address' />
                </div>
                {/* email */}
                <div className='form-group'>
                  <label className='my-1' htmlFor='email'>Email</label>
                  <input className='custom-input' type='email' id='email' value={email} placeholder='email' required
                    onChange={(ev) => inputhandler(ev, 'email')} />
                </div>
                {/* phone number */}
                <div className='form-group'>
                  <label className='my-1' htmlFor='phonenumber'>Phone Number</label>
                  <input className='custom-input' type='tel' id='phonenumber' maxLength={10} minLength={10}  required value={phonenumber} placeholder='phone number'
                    onChange={(ev) => inputhandler(ev, 'phonenumber')} />
                </div>
                {/* region */}
                <div className='form-group'>
                  <label className='my-1' htmlFor='region'>Region</label>
                  <select className='custom-select' id='region' value={newsupplier.region} onChange={(ev) => inputhandler(ev, 'region')}>
                    <option value=''>select region</option>
                    {
                      regions.length > 0 && regions.map((item, index) => {
                        return <option key={index} value={item}>{item}</option>
                      })
                    }
                  </select>
                </div>
                {/* contact person */}
                <div className='form-group'>
                  <label className='my-1' htmlFor='contactperson'>Contact Person</label>
                  <input className='custom-input' id='contactperson' value={contactperson} placeholder='contact person'
                    onChange={(ev) => inputhandler(ev, 'contactperson')} />
                </div>
                <div className='form-group mt-2'>
                  <button className='btn btn-primary btn-sm' type='submit'
                    onClick={(ev) => handleSubmit(ev, tab, newsupplier)}
                  >
                    {tab === 'edit' ? 'Update supplier information' : 'Add New supplier'}
                  </button>
                </div>
    
              </form>
             </div>
            </div>
            )
      }
      </div></>
  )
}
