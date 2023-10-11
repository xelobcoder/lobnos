import React, { useState, useEffect, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { useRouter } from 'next/router';
import { customFetch, regions, defaultSupplierdata, customPost } from '../Auth/customFetch';


export default function ADD_NEW_SUPPLIER() {
  const tab = useRouter().query.tab;
  const supplierid = useRouter().query.supplierid;

  const [newsupplier, setNewSupplier] = useState(defaultSupplierdata);
  // destructure 
  const { name, address, email, phonenumber, region, contactperson } = newsupplier;
  // handle the inputs
  const inputhandler = (ev, field) => {
    let value = ev.target.value;
    setNewSupplier((prev) => {
      return { ...prev, [field]: value }
    })
  }


  const handleSubmit = async (ev, tab, newsupplier) => {
    ev.preventDefault();
    const method = tab === 'edit' ? 'PUT' : 'POST';
    try {
      const senddata = async () => {
        const data = await customPost(`suppliers?supplierid=${supplierid}`, method, newsupplier);
        const { statusCode, status, message } = data;
        if (statusCode === 200 && status === 'success') {
          setNewSupplier(defaultSupplierdata);
        }
        alert(message);
      }

      const checkEmptyFields = (dataset) => {
        let empty = false;
        for (let key in dataset) {
          if (dataset[key] === '') {
            empty = true;
            break;
          }
        }
        return empty;
      }

      if (checkEmptyFields(newsupplier)) {
        alert('please fill all fields');
        return;
      }
      else {
        senddata()
      }
    }
    catch (error) {
      console.log(error)
    }
  }





  useEffect(() => {
    if (tab === 'edit' && supplierid) {
      const getResponse = async () => {
        const data = await customFetch(`suppliers?supplierid=${supplierid}`)
        const { statusCode, status, result } = data;
        if (statusCode === 200  && result.length > 0) {
          setNewSupplier(result[0])
        }
      }
      getResponse()
    }
  }, [tab, supplierid])

  return (
    <>
      <div className='p-3'>
        <div className='mt-2='>
          <h4 className='bg-info br-5 p-2 lims-color' style={{ width: '300px' }}>
            {tab === 'edit' ? 'Update supplier information' : 'Add New supplier'}
          </h4>
          <form>
            <div className='form-group'>
              <label htmlFor='name'>supplier name</label>
              <input className='custom-input' value={name} list='customers' name='name' placeholder='supplier name'
                onChange={(ev) => inputhandler(ev, 'name')} />

            </div>

            <div className='form-group'>
              <label htmlFor='address'>address</label>
              <input className='custom-input' id='addx' value={address}
                onChange={(ev) => inputhandler(ev, 'address')}
                placeholder='address' />
            </div>
            {/* email */}
            <div className='form-group'>
              <label htmlFor='email'>email</label>
              <input className='custom-input' type='email' id='email' value={email} placeholder='email' required
                onChange={(ev) => inputhandler(ev, 'email')} />
            </div>
            {/* phone number */}
            <div className='form-group'>
              <label htmlFor='phonenumber'>phone number</label>
              <input className='custom-input' type='number' id='phonenumber' maxLength={10} minLength={10} required value={phonenumber} placeholder='phone number'
                onChange={(ev) => inputhandler(ev, 'phonenumber')} />
            </div>
            {/* region */}
            <div className='form-group'>
              <label htmlFor='region'>region</label>
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
              <label htmlFor='contactperson'>contact person</label>
              <input className='custom-input' id='contactperson' value={contactperson} placeholder='contact person'
                onChange={(ev) => inputhandler(ev, 'contactperson')} />
            </div>
            <div className='form-group mt-2'>
              <Button className='btn btn-primary' type='submit'
                onClick={(ev) => handleSubmit(ev, tab, newsupplier)}
              >
                {tab === 'edit' ? <UpgradeIcon /> : <AddCommentIcon />}
                {tab === 'edit' ? 'Update supplier information' : 'Add New supplier'}
              </Button>
            </div>

          </form>
        </div>

      </div></>
  )
}
