import { useState, useEffect, useCallback } from 'react';
import { regions, defaultSupplierdata,getDataAndUpdateState } from '../Auth/customFetch';
import Loader from '../accessories/Loader';

export default function ADD_NEW_SUPPLIER({ supplierid, isEditing, handleAddNew, reset }) {
  const [loading, setLoading] = useState(false);

  const [newsupplier, setNewSupplier] = useState(defaultSupplierdata);
  const { name, address, email, phonenumber, region, contactperson } = newsupplier;
  const inputhandler = (ev, field) => {
    let value = ev.target.value;setNewSupplier((prev) => {
      return { ...prev, [field]: value }
    })
  }




  const getEditRecord = useCallback(async () => {
    if (isEditing && supplierid) {
      setLoading(true);
      getDataAndUpdateState(setNewSupplier, `suppliers/getsupplier?supplierid=${supplierid}`, true)
        .then((data) => { setNewSupplier(data[0]) })
        .catch((err) => { alert("something wrong occured", { autoClose: 3000 }) });
      setLoading(false);
    }
  }, [supplierid, isEditing])




  useEffect(() => {
    getEditRecord();
  }, [getEditRecord])



  const renderingView = () => {
    if (loading) return <Loader />
    else {
      return (
        <div className='card bg-white'>
          <div className="card-header bg-secondary text-white d-flex justify-content-between">
            <h4>
              {isEditing ? 'Update supplier information' : 'Add New supplier'}
            </h4>
            {isEditing && <button onClick={(ev) => { reset(); setNewSupplier(defaultSupplierdata); }} className='btn btn-danger btn-sm'>reset</button>}
              </div>
          <div className='card-body'>
            <form className='grid grid-50'>
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
                  {regions.length > 0 && regions.map((item, index) => {
                        return <option key={index} value={item}>{item}</option>
                      })
                    }
                  </select>
                </div>
                {/* contact person */}
                <div className='form-group'>
                  <label className='my-1' htmlFor='contactperson'>Contact Person</label>
                <input className='custom-input' type='text' id='contactperson' value={contactperson} placeholder='contact person'
                    onChange={(ev) => inputhandler(ev, 'contactperson')} />
                </div>
                <div className='form-group mt-2'>
                <button className='btn btn-primary btn-sm' type='button'
                  onClick={(ev) => handleAddNew(ev, newsupplier)}
                  >
                  {isEditing ? 'Update supplier information' : 'Add New supplier'}
                  </button>
                </div>
    
              </form>
          </div>
        </div>
      )
    }
  }

  return (
    <div className='p-2'>
      {renderingView()}
    </div>
  )
}
