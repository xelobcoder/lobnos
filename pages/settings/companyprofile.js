import React, { useState, useEffect, useRef } from 'react';
import {customFetch} from '../../components/Auth/customFetch';

export default function CompanyProfile() {
  const defaultdata = {
    name: '',
    email: '',
    phonenumber: [0],
    motto: '',
    address: '',
  }
  const [companydata, setcompanyData] = useState(defaultdata);
  const imageRef = useRef()

  const handleData = function (ev) {
    let endpoint = `api/settings/companydata`;
    // push data to db
    const is_field_filled = Object.values(companydata).filter((item, index) => item == '')

    const isGood = is_field_filled.length > 0 ? true : false;
    // async function  to push data 
    const pushdata = async function (endpoint, opts) {
      let turn = await fetch(endpoint, opts);
      let response = turn.json();
      return response;
    }
    // handle image upload
    const imageHandle = function () {
      if (imageRef.current) {
        let image = imageRef.current.files[0];
        // determine accepted extensions
        let extension = ['jpeg', 'png', 'jpg'].includes(image.name.split('.')[1]);
        if (image && extension) {
          let imagedata = new FormData();
          // prepare image data for upload using formData API
          imagedata.append('file', image);
          let opts = { method: 'POST', body: imagedata }
          pushdata(`http://localhost:3000/api/settings/companyimage`, opts)
            .then((t) => {
              if (t.message == 'Image uploaded successfully') {
                // EMPTY DATA RECEPTOR
                setcompanyData(defaultdata)
                imageRef.current.value = '';
              }
            })
            .catch((err) => console.log(err))
        }
        else {
          console.warn(['jpeg', 'png', 'jpg '] + 'extensions ' + 'required')
        }
      }
    }


    if (!isGood) {
      let opts1 = { method: 'POST', body: JSON.stringify({ ...companydata, target: 'profile' }) }
      pushdata(endpoint, opts1)
        .then((t) => {
          if (t.status == 200 || t.message == 'information uploaded') {
            imageHandle()
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }

  }

  // read the content of an image 

  // display image on upload
  const handlePreview = function (image) {
    let reader = new FileReader();
    reader.onload = function () {

    }


  }
  // loads exiting data on page visit if the data exist 
  useEffect(() => {
    const data = async function() {
      let response = await customFetch('settings/companydata');
      console.log(response)
    }
    data()
  }, [])



  return (
    <>
      <div className='container' style={{ backgroundColor: '#00224f18' }}>
        <div className='row' style={{ display: 'grid', gridTemplateColumns: companydata.name == '' ? '100% auto' : '60% auto' }}>
          <div>
            {/* form  */}
            <form className='company-profile-form'>
              <div className='form-group'>
                <label>name: </label>
                <input className='form-control' value={companydata.name} type='text' onChange={(e) => { setcompanyData({ ...companydata, name: e.target.value }) }} />
              </div>

              <div className='form-group'>
                <label>email: </label>
                <input className='form-control' value={companydata.email} type='email' onChange={(e) => { setcompanyData({ ...companydata, email: e.target.value }) }} />
              </div>

              <div className='form-group'>
                <label>address: </label>
                <input className='form-control' value={companydata.address} type='text' onChange={(e) => { setcompanyData({ ...companydata, address: e.target.value }) }} />
              </div>

              <div className='form-group'>
                <label>motto: </label>
                <input className='form-control' value={companydata.motto} type='text' onChange={(e) => { setcompanyData({ ...companydata, motto: e.target.value }) }} />
              </div>

              <div className='form-group'>
                <label>phone number: </label>
                <input className='form-control' multiple value={companydata.phonenumber} type='tel' minLength={10} maxLength={28} onChange={(e) => { setcompanyData({ ...companydata, phonenumber: e.target.value }) }} />
              </div>
              <div className='form-group'>
                <label>company logo: </label>
                <input type='file' className='form-control mt-3' ref={imageRef} />
              </div>
              <div className='form-group mt-3'>
                <button type='button' className='btn btn-primary' onClick={(e) => handleData(e)}>
                  save information
                </button>
              </div>
            </form>

          </div>
          {
            companydata.name == '' ? null : (
              <div className='profile-side'>
                <div className='-tag'>
                  <label>company name</label>
                  <div className='group-label'> {companydata.name}</div>
                </div>

                {/* email */}
                <div className='-tag'>
                  <label>email</label>
                  <div className='group-label'> {companydata.email}</div>
                </div>

                {/* address */}
                <div className='-tag'>
                  <label>address</label>
                  <div className='group-label'> {companydata.address}</div>
                </div>

                {/* motto && phone number */}
                <div className='-tag'>
                  <label>motto && phone number</label>
                  <div className='group-label'>
                    {companydata.motto}
                    <br />
                    {companydata.phonenumber}
                  </div>
                </div>

              </div>
            )
          }
        </div>
        {/* end of form */}
      </div>
    </>
  )
}
