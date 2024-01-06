import React, { useState, useEffect } from 'react'
import { getDataAndUpdateState, handleChangeWithState, handleResponse, validateFormData } from '../../components/Auth/customFetch';
import {ToastContainer, toast} from 'react-toastify';
import { useSearchParams } from 'next/navigation';
export default function BasicInformationClinician() {
  const [OrganizationList, setOrganization] = useState([]);
  const clinicianid = useSearchParams().get("clinicianid");
  console.log(clinicianid);
  const defaultData = {
    id: clinicianid,
    name: "",
    phone: "",
    email: "",
    organization: 0,
    location: "",
    address: "",
    occupation: "",
  };

  const [data, setData] = useState(defaultData);

  const getClientForEdit = (originaldata) => {
    setData(originaldata)
  }

  const setDefault = () => { setData(defaultData) }

  const handleSubmit = async () => {
    const handleResponse = function (data) {
      const { statusCode, status, message } = data;
      if (statusCode == 200 && status == 'success') {
        toast.success(message,{position: toast.POSITION.TOP_CENTER, autoClose: 2000});
        setDefault();
      } else {
        toast.error(message,{position: toast.POSITION.TOP_CENTER, autoClose: 2000});
      }
    }
    await validateFormData(data, true, [], 'clinicians', handleResponse)
  }


  useEffect(() => {
    if (clinicianid) {
      try {
        getDataAndUpdateState(setData, `clinicians?id=${clinicianid}`, true)
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              getClientForEdit(data[0])
            }
          })
          .catch((err) => console.log(err))
      } catch (err) {
        console.log(err)
      }
    }
  }, [clinicianid])

  useEffect(() => {
    getDataAndUpdateState(setOrganization, 'organization')
  }, [])


  return (
    <>
      <ToastContainer/>
  <div className='container'>
  <form autoComplete="true">
    <div>
      <div className="mb-3 mt-3">
        <label htmlFor="name" className="form-label">Clinician Name</label>
        <input
          type="text"
          className="custom-input"
          id="name"
          placeholder="Enter Clinician Name"
          value={data.name}
          style={{ width: "100%" }}
          size='sm'
          onChange={(event) => handleChangeWithState(event, "name", setData, data)}
        />
      </div>
      <div className="mb-3 mt-3">
        <label htmlFor="phone" className="form-label">Phone Number</label>
        <input
          type="tel"
          className="custom-input"
          id="phone"
          placeholder="Enter Phone Number"
          value={data.phone}
          onChange={(event) => handleChangeWithState(event, "phone", setData, data)}
          maxLength={10}
          minLength={10}
          style={{ width: "100%" }}
          size='sm'
        />
      </div>
      <div className="mb-3 mt-3">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          className="custom-input"
          id="email"
          placeholder="Enter Email"
          style={{ width: "100%" }}
          size='sm'
          value={data.email}
          onChange={(event) => handleChangeWithState(event, "email", setData, data)}
        />
      </div>
      <div className="mb-3 mt-3">
        <label htmlFor="organization" className="form-label">Organization</label>
        <select
          className="custom-select"
          id="organization"
          style={{ width: "100%" }}
          onChange={(event) => {
            if (Array.isArray(OrganizationList) && OrganizationList.length > 0) {
              setData({ ...data, organization: event.target.value });
            }
          }}
        >
          <option value="">Organization</option>
          {OrganizationList.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3 mt-3">
        <label htmlFor="location" className="form-label">Location</label>
        <input
          type="text"
          className="custom-input"
          id="location"
          onChange={(event) => handleChangeWithState(event, "location", setData, data)}
          placeholder="Enter Location"
          style={{ width: "100%" }}
          size="sm"
          value={data.location}
        />
      </div>
      <div className="mb-3 mt-3">
        <label htmlFor="address" className="form-label">Address</label>
        <input
          type="text"
          className="custom-input"
          id="address"
          placeholder="Enter Address"
          value={data.address}
          onChange={(event) => handleChangeWithState(event, "address", setData, data)}
          style={{ width: "100%" }}
          size="sm"
        />
      </div>
      <div className="mb-3 mt-3">
        <label htmlFor="occupation" className="form-label">Occupation</label>
        <select
          className="custom-select"
          id="occupation"
          style={{ width: "100%" }}
          value={data.occupation}
          onChange={(event) => handleChangeWithState(event, "occupation", setData, data)}
          size="sm"
        >
          <option value="">Select occupation</option>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="therapist">Therapist</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
    <button type="button" className='btn btn-primary btn-sm' onClick={handleSubmit}>
      Submit
    </button>
  </form>
</div>

    </>
  );
}
