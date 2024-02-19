import React from 'react';
import { Form } from 'react-bootstrap';
import { handleMobile, handleEmail } from '../Auth/registerclient';
import style from "../../styles/registration.module.css";

export default function PersonalInformationRegistration({ setData, data, setError, card, minify }) {
  return (
    <>
      <div className={card === true ? `card m-0 p-0` : 'none '} >
        <div className="card-header">
          {card === true && (
            <h5>
              Personal Information
            </h5>
          )}
        </div>
        <div >
          <form className={`card-body mx-2 ${minify ? 'grid-50' : ''}`} autoComplete='no' noValidate autoCorrect='false'>
            <div className='form-row'>
              <label>First Name</label>
              <input
                onChange={(e) => {
                  setData({ ...data, personalInformation: { ...data.personalInformation, firstname: e.target.value } });
                }}
                placeholder="First Name"
                className="custom-input "
                value={data.personalInformation.firstname}
                type="text"
                size='small'
                required
              />
            </div>
            <div className='form-row'>
              <label>Last Name</label>
              <input
                className="custom-input "
                type="text"
                label="lastname"
                placeholder="Last Name"
                required
                value={data.personalInformation.lastname}
                onChange={(e) => {
                  setData({ ...data, personalInformation: { ...data.personalInformation, lastname: e.target.value } });
                }}
              />
            </div>
            <div className='form-row'>
              <label>Middle Name</label>
              <input
                className="custom-input "
                placeholder="Middle Name"
                type="text"
                value={data.personalInformation.middlename}
                onChange={(e) => {
                  setData({ ...data, personalInformation: { ...data.personalInformation, middlename: e.target.value } });
                }}
              />
            </div>
            <div className='form-row'>
              <label>Mobile Number</label>
              <input
                type="tel"
                inputMode="tel"
                maxLength={10}
                minLength={10}
                value={data.personalInformation.mobile}
                name="mobilenumber"
                className="custom-input "
                label="Mobile Number"
                onChange={(e) => {
                  handleMobile(e, setData, data, setError);
                }}
              />
            </div>
            <div className='form-row'>
              <label>Email</label>
              <input
                size="small"
                type="email"
                value={data.personalInformation.email}
                className="custom-input "
                name="email"
                onBlur={(ev) =>  {console.log(data)}}
                onChange={(e) => handleEmail(e, setData, data, setError)}
                label="Email"
              />
            </div>
            <div className='form-row'>
              <label>Date of Birth</label>
              <div className={style.age}>
                <input
                  className="custom-input "
                  min={1}
                  max={31}
                  type="number"
                  value={data.personalInformation.days}
                  placeholder="Days"
                  onChange={(e) => {
                    setData({ ...data, personalInformation: { ...data.personalInformation, days: e.target.value } });
                  }}
                  label="Day"
                />
                <input
                  className="custom-input "
                  label="Months"
                  min={1}
                  max={12}
                  type="number"
                  placeholder="Months"
                  name="months"
                  value={data.personalInformation.months}
                  onChange={(e) => {
                    setData({ ...data, personalInformation: { ...data.personalInformation, months: e.target.value } });
                  }}
                />
                <input
                  className="custom-input "
                  label="Years"
                  min={1900}
                  max={new Date().getFullYear()}
                  type="number"
                  name="years"
                  value={data.personalInformation.years}
                  onChange={(e) => {
                    setData({ ...data, personalInformation: { ...data.personalInformation, years: e.target.value } });
                  }}
                  placeholder="Years"
                />
              </div>
            </div>
            <div className='form-row'>
              <label>Age</label>
              <input
                value={data.personalInformation.age}
                onChange={(e) => setData({ ...data, personalInformation: { ...data.personalInformation, age: e.target.value } })}
                type="number"
                min={0}
                max={150}
                className="custom-input "
                placeholder="Age"
              />
            </div>
            <div className='form-row'>
              <label>Age Type</label>
              <select
                className="custom-select "
                onChange={(e) =>
                  setData({ ...data, personalInformation: { ...data.personalInformation, agetype: e.target.value } })
                }
                value={data.personalInformation.agetype}
              >
                <option>select an option</option>
                <option value="years">Years</option>
                <option value="months">Months</option>
                <option value="days">Days</option>
              </select>
            </div>
            {/*  */}
            <div className="form-row">
              <label>Occupation</label>
              <input
                type="text"
                placeholder="Occupation"
                name="occupation"
                className="custom-input "
                value={data.personalInformation.occupation}
                onChange={(e) => {
                  setData({
                    ...data,
                    personalInformation: {
                      ...data.personalInformation,
                      occupation: e.target.value,
                    },
                  });
                }}
              />
            </div>
            <div className="form-row">
              <label>Organization</label>
              <input
                type="text"
                placeholder="Patient Organization"
                name="patientOrganization"
                className="custom-input h-40"
                value={data.personalInformation.patientOrganization}
                onChange={(e) => {
                  setData({
                    ...data,
                    personalInformation: {
                      ...data.personalInformation,
                      patientOrganization: e.target.value,
                    },
                  });
                }}
              />
            </div>
            <div className="form-row">
              <label>Gender</label>
              <div className='d-flex '>
                <Form.Check
                  type="radio"
                  label="Female"
                  name="gender"
                  style={{ marginRight: '20px' }}
                  value="female"
                  checked={data.personalInformation.gender === 'female'}
                  onChange={(e) => {
                    setData({
                      ...data,
                      personalInformation: {
                        ...data.personalInformation,
                        gender: e.target.value,
                      },
                    });
                  }}
                />
                <Form.Check
                  type="radio"
                  label="Male"
                  name="gender"
                  style={{ marginRight: '20px' }}
                  value="male"
                  checked={data.personalInformation.gender === 'male'}
                  onChange={(e) => {
                    setData({
                      ...data,
                      personalInformation: {
                        ...data.personalInformation,
                        gender: e.target.value,
                      },
                    });
                  }}
                />
                <Form.Check
                  type="radio"
                  label="Other"
                  name="gender"
                  value="other"
                  checked={data.personalInformation.gender === 'other'}
                  onChange={(e) => {
                    setData({
                      ...data,
                      personalInformation: {
                        ...data.personalInformation,
                        gender: e.target.value,
                      },
                    });
                  }}
                />
              </div>
            </div>
            <div className="form-row">
              <label>Marital Status</label>
              <div className='d-flex'>
                <Form.Check
                  type="radio"
                  label="Single"
                  name="maritalstatus"
                  style={{ marginRight: '20px' }}
                  value="single"
                  checked={data.personalInformation.maritalstatus === 'single'}
                  onChange={(e) => {
                    setData({
                      ...data,
                      personalInformation: {
                        ...data.personalInformation,
                        maritalstatus: e.target.value,
                      },
                    });
                  }}
                />
                <Form.Check
                  type="radio"
                  label="Married"
                  name="maritalstatus"
                  value="married"
                  checked={data.personalInformation.maritalstatus === 'married'}
                  onChange={(e) => {
                    setData({
                      ...data,
                      personalInformation: {
                        ...data.personalInformation,
                        maritalstatus: e.target.value,
                      },
                    });
                  }}
                />
              </div>
            </div>
            <div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}
