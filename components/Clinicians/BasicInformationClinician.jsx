import React, { useState, useEffect } from 'react'
import { TextField, MenuItem, Select, FormControl, InputLabel, Autocomplete } from '@mui/material';
import { getDataAndUpdateState, handleResponse, validateFormData } from '../../components/Auth/customFetch';
import { useRouter } from 'next/router';
export default function BasicInformationClinician() {
  const [OrganizationList, setOrganization] = useState([]);
  const clinicianid = useRouter().query.clinicianid;

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

  const handleChange = (event, target) => {
    const { value } = event.target;
    setData({ ...data, [target]: value })
  }

  const getClientForEdit = (originaldata) => {
    // converting the data to lowercase
    const {
      EMAIL,
      ID,
      LOCATION,
      NAME,
      OCCUPATION,
      ORGANIZATION,
      ADDRESS,
      PHONE } = originaldata;

    const data = {
      id: ID,
      name: NAME,
      phone: PHONE,
      email: EMAIL,
      organization: ORGANIZATION,
      location: LOCATION,
      address: ADDRESS,
      occupation: OCCUPATION,
    }
    setData(data)
  }

  const setDefault = () => { setData(defaultData) }

  const handleSubmit = async () => {
    const handleResponse = function (data) {
      const { statusCode, status, message } = data;
      if (statusCode == 200 && status == 'success') {
        alert(message);
        setDefault()
      } else {
        alert(message);
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
      <div className='container'>
        <form autoCapitalize="true" autoComplete="true">
          <div>
            <div className="mb-3 mt-3">
              <TextField
                type="text"
                label='clinician name'
                id="name"
                value={data.name}
                sx={{ width: "100%" }}
                size='small'
                onChange={(event) => handleChange(event, "name")}
              />
            </div>
            <div className="mb-3 mt-3">
              <TextField
                type="tel"
                inputMode='numeric'
                label='phone number'
                value={data.phone}
                onChange={(event) => handleChange(event, "phone")}
                maxLength={10} minLength={10}
                sx={{ width: "100%" }}
                size='small'
              />
            </div>
            <div className="mb-3 mt-3">
              <TextField
                type="email"
                label='email'
                id="email"
                sx={{ width: "100%" }}
                size='small'
                value={data.email}
                onChange={(event) => handleChange(event, "email")}
              />
            </div>
            <div className="mb-3 mt-3">
              <Autocomplete
                id="organization"
                options={OrganizationList}
                getOptionLabel={(option) => option.NAME}
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <>
                    <TextField
                      {...params}
                      label="Organization"
                      size="small"
                    />
                  </>
                )}
                onChange={(event, value) => {
                  if (Array.isArray(OrganizationList) && OrganizationList.length > 0) {
                    setData({ ...data, organization: value.ID })
                  }
                }}
              />
            </div>
            <div className="mb-3 mt-3">
              <TextField
                type="text"
                onChange={(event) => handleChange(event, "location")}
                id="location"
                size="small"
                value={data.location}
                label="Location"
                sx={{ width: "100%" }}
              />
            </div>
            <div className="mb-3 mt-3">
              <TextField
                id="address"
                size="small"
                value={data.address}
                onChange={(event) => handleChange(event, "address")}
                label="Address"
                sx={{ width: "100%" }}
              />
            </div>
            <div className="mb-3 mt-3">
              <label className='text-info'>Select occupation that matches closest to yours</label>
              <FormControl sx={{ width: "100%" }}>
                <InputLabel id="occupation-label">Occupation</InputLabel>
                <Select
                  labelId="occupation-label"
                  id="occupation"
                  value={data.occupation}
                  onChange={(event) => handleChange(event, "occupation")}
                  variant="filled"
                  size="small"
                >
                  <MenuItem value="">Select occupation</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="nurse">Nurse</MenuItem>
                  <MenuItem value="pharmacist">Pharmacist</MenuItem>
                  <MenuItem value="therapist">Therapist</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
          <button
            type="button"
            variant="contained"
            className='custom-button'
            color="primary"
            onClick={handleSubmit}
            // startIcon={<SaveAs />}
            style={{ marginTop: '16px', marginBottom: '20px' }}
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
}
