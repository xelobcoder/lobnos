import React, { useState, useEffect, useRef } from 'react';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import Image from 'next/image';
import { Container } from '@mui/material';
import { Padding } from '@mui/icons-material';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout';

export default function CompanyProfile() {
  const defaultdata = {
    name: '',
    email: '',
    phonenumber: [0],
    motto: '',
    address: '',
    website: '',
    street: '',
    alternativeNumber: ''
  }
  const [companydata, setcompanyData] = useState(defaultdata);
  const [selectedImage, setSelectedImages] = useState(null);
  const [preview, setPreview] = useState(false)

  const handleData = async function (ev) {
    try {
      const Okay = Object.keys(companydata).filter((e, i) => { return companydata[e] == '' });

      const rightMobile = companydata['phonenumber'].length == 10 && companydata['phonenumber'].at(0) == 0;
      if (Okay.length == 0 && rightMobile) {
        let turn = await customPost('settings/companyprofile', 'POST', companydata);
        if (turn?.status == 'success') {
          setcompanyData(defaultdata)
          alert('updated successfully');
        }
      } else {
        if (!rightMobile) {
          alert('Incorrect Phone Number');
        } else {
          alert(`${Okay.join(',')} field inputs are required`)
        }
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  // read the content of an image 

  // display image on upload
  const handlePreview = async function (events) {
    let file = events.target.files[0];
    setSelectedImages(URL.createObjectURL(file))

    const formData = new FormData();
    formData.append('file', file);
    // Make an API call to upload the file
    try {
      const response = await fetch(`${process.env.BASEURL}/settings/companyprofile/images`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('File uploaded successfully');
      } else {
        console.error('Error uploading file:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }

  }

  // loads exiting data on page visit if the data exist 
  useEffect(() => {
    const fetchData = async function () {
      try {
        const response = await customFetch('settings/companyprofile');
        setcompanyData(response);
        const getData = await customFetch('settings/companyprofile/images');
        const imageData = await getData.blob(); // Convert the response to a Blob
        setSelectedImages(URL.createObjectURL(imageData)); // Set the selectedImage using createObjectURL
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [])



  return (
    <SettingsLayout>
      <div className='card br-5 m-3'>
        <div className='card-header p-2' style={{ backgroundColor: 'whitesmoke' }}>
          <h4 className='text-capitalize'>Upload Company information</h4>
        </div>
        <div className='card-body'>
          <form  style={{display:'grid',gridTemplateColumns:'50% auto',gridGap:'10px'}}>
            <div className="form-group ">
              <label className='text-primary'>name </label>
              <input
                className="custom-input"
                value={companydata.name}
                required
                type="text"
                onChange={(e) => {
                  setcompanyData({ ...companydata, name: e.target.value });
                }}
              />
            </div>

            <div className="form-group  ">
              <label className='text-primary'>email</label>
              <input
                className="custom-input"
                value={companydata.email}
                type="email"
                required
                onChange={(e) => {
                  setcompanyData({ ...companydata, email: e.target.value });
                }}
              />
            </div>

            <div className="form-group ">
              <label className='text-primary'>address </label>
              <input
                className="custom-input"
                value={companydata.address}
                type="text"
                required
                onChange={(e) => {
                  setcompanyData({ ...companydata, address: e.target.value });
                }}
              />
            </div>

            <div className="form-group ">
              <label className='text-primary'>motto</label>
              <input
                className="custom-input"
                value={companydata.motto}
                required
                type="text"
                onChange={(e) => {
                  setcompanyData({ ...companydata, motto: e.target.value });
                }}
              />
            </div>

            <div className="form-group ">
              <label className='text-primary'>phone number </label>
              <input
                className="custom-input"
                multiple
                value={companydata.phonenumber}
                type="tel"
                minLength={10}
                maxLength={10}
                onChange={(e) => {
                  setcompanyData({
                    ...companydata,
                    phonenumber: e.target.value,
                  });
                }}
              />
            </div>
            <div className='form-group'>
              <label className='text-primary'>street</label>
              <input className='custom-input' value={companydata.street}
                onChange={(e) => setcompanyData({ ...companydata, street: e.target.value })} />
            </div>
            <div className='form-group'>
              <label className='text-primary'>alternative Number</label>
              <input className='custom-input' value={companydata.alternativeNumber}
                onChange={(e) => setcompanyData({ ...companydata, alternativeNumber: e.target.value })} />
            </div>
            <div className='form-group'>
              <label className='text-primary'>website</label>
              <input className='custom-input' value={companydata.website}
                onChange={(e) => setcompanyData({ ...companydata, website: e.target.value })} />
            </div>
            <div className="form-group ">
              <label className='text-primary'>Upload Images </label>
              <input
                type="file"
                className="custom-input mt-3"
                onChange={handlePreview}
              />
            </div>
          </form>
        </div>
        <div className='card-footer'>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => handleData(e)}
          >
            save information
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
}