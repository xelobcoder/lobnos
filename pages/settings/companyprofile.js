import React, { useState, useEffect, useRef } from 'react';
import { customFetch, customPost } from '../../components/Auth/customFetch';

export default function CompanyProfile() {
  const defaultdata = {
    name: '',
    email: '',
    phonenumber: [0],
    motto: '',
    address: '',
  }
  const [companydata, setcompanyData] = useState(defaultdata);
  const [selectedImage, setSelectedImages] = useState(null);

  const handleData = async function (ev) {
    let turn = await customPost('settings/companyprofile', 'POST', companydata);
    if (turn?.status == 'success') {
      setcompanyData(defaultdata)
      alert('updated successfully');
    }
  }

  // read the content of an image 

  // display image on upload
  const handlePreview = async function (events) {
    let file = events.target.files[0];
    setSelectedImages(file);

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
    const data = async function () {
      let response = await customFetch('settings/companyprofile');
      setcompanyData(response)
    }
    data()
  }, [])



  return (
    <>
      <div  style={{ backgroundColor: 'whitesmoke', height: '100vh' }}>
        <div className="container">
          <div
            className="row"
            style={{
              display: "grid",
              gridTemplateColumns:
                companydata.name == "" ? "100% auto" : "60% auto",
            }}
          >
            <div>
              {/* form  */}
              <form className="company-profile-form bg-white p-5 mt-4">
                <div className="form-group mt-2">
                  <label>name: </label>
                  <input
                    className="custom-input"
                    value={companydata.name}
                    type="text"
                    onChange={(e) => {
                      setcompanyData({ ...companydata, name: e.target.value });
                    }}
                  />
                </div>

                <div className="form-group mt-2">
                  <label>email: </label>
                  <input
                    className="custom-input"
                    value={companydata.email}
                    type="email"
                    onChange={(e) => {
                      setcompanyData({ ...companydata, email: e.target.value });
                    }}
                  />
                </div>

                <div className="form-group mt-2">
                  <label>address: </label>
                  <input
                    className="custom-input"
                    value={companydata.address}
                    type="text"
                    onChange={(e) => {
                      setcompanyData({ ...companydata, address: e.target.value });
                    }}
                  />
                </div>

                <div className="form-group mt-2">
                  <label>motto: </label>
                  <input
                    className="custom-input"
                    value={companydata.motto}
                    type="text"
                    onChange={(e) => {
                      setcompanyData({ ...companydata, motto: e.target.value });
                    }}
                  />
                </div>

                <div className="form-group mt-2">
                  <label>phone number: </label>
                  <input
                    className="custom-input"
                    multiple
                    value={companydata.phonenumber}
                    type="tel"
                    minLength={10}
                    maxLength={28}
                    onChange={(e) => {
                      setcompanyData({
                        ...companydata,
                        phonenumber: e.target.value,
                      });
                    }}
                  />
                </div>
                <div className="form-group mt-2">
                  <label>company logo: </label>
                  <input
                    type="file"
                    className="custom-input mt-3"
                    onChange={handlePreview}
                  />
                </div>
                <div className="form-group mt-3">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => handleData(e)}
                  >
                    save information
                  </button>
                </div>
              </form>
            </div>
            {companydata.name == "" ? null : (
              <div className="profile-side">
                <div className="-tag">
                  <label>company name</label>
                  <div className="group-label"> {companydata.name}</div>
                </div>

                {/* email */}
                <div className="-tag">
                  <label>email</label>
                  <div className="group-label"> {companydata.email}</div>
                </div>

                {/* address */}
                <div className="-tag">
                  <label>address</label>
                  <div className="group-label"> {companydata.address}</div>
                </div>

                {/* motto && phone number */}
                <div className="-tag">
                  <label>motto && phone number</label>
                  <div className="group-label">
                    {companydata.motto}
                    <br />
                    {companydata.phonenumber}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* end of form */}
        </div>
      </div>
    </>
  );
}
