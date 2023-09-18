import React from 'react'
import { IconButton, Radio, FormControl, FormLabel, FormControlLabel, RadioGroup } from '@mui/material';
import { PersonPinCircle } from '@mui/icons-material';
import { handleMobile, handleEmail } from '../Auth/registerclient';
import style from "../../styles/registration.module.css";

export default function PersonalInfomationRegistration({ setData, data, setError, card }) {
  return (
    <>
      <div className={card == true ? `card m-0 p-0` : 'none'} id="card-border">
        <div className="card-header">
          {card == true &&
            <h5 className='btn btn-danger text-white'>
              <IconButton sx={{ color: 'white' }}>
                <PersonPinCircle />
              </IconButton>
              Personal Information
            </h5>}
        </div>
        <div className="card-body">
          <label>first name </label>
          <input
            onChange={(e) => {
              setData({ ...data, personalInformation: { ...data.personalInformation, firstname: e.target.value } });
            }}
            placeholder="firstname"
            className="custom-input"
            value={data.firstname}
            type="text"
            size='small'
            required
            tabIndex={2}
          />
          <label>last name </label>
          <input
            className="custom-input"
            type="text"
            label="lastname"
            placeholder="lastname"
            required
            value={data.personalInformation.lastname}
            onChange={(e) => {
              setData({ ...data, personalInformation: { ...data.personalInformation, lastname: e.target.value } });
            }}
            tabIndex={3}
          />

          <label>middle name</label>
          <input
            className="custom-input"
            tabIndex={4}
            placeholder="middlename"
            type="text"
            value={data.personalInformation.middlename}
            onChange={(e) => {
              setData({ ...data, personalInformation: { ...data.personalInformation, middlename: e.target.value } });
            }}
          />
          <label>mobile number </label>
          <input
            type="tel"
            inputMode="tel"
            maxLength={10}
            minLength={10}
            required
            value={data.personalInformation.mobile}
            name="mobilenumber"
            className="custom-input"
            label="mobile number"
            tabIndex={5}
            onChange={(e) => {
              handleMobile(e, setData, data, setError);
            }}
          />
          <label>email</label>
          <input
            size="small"
            type="email"
            value={data.personalInformation.email}
            className="custom-input"
            tabIndex={6}
            name="email"
            onChange={(e) => handleEmail(e, setData, data, setError)}
            label="email"
          />
          <label>Date of Birth</label>
          <FormControl className={style.age}>
            <input
              className="custom-input"
              min={1}
              max={31}
              type="number"
              value={data.personalInformation.days}
              tabIndex={7}
              placeholder="days"
              onChange={(e) => {
                setData({ ...data, personalInformation: { ...data.personalInformation, days: e.target.value } });
              }}
              label="day"
              name="day"
            />
            <input
              className="custom-input"
              label="months"
              min={1}
              max={12}
              type="number"
              placeholder="months"
              tabIndex={8}
              name="months"
              value={data.personalInformation.months}
              onChange={(e) => {
                setData({ ...data, personalInformation: { ...data.personalInformation, months: e.target.value } });
              }}
            />
            <input
              className="custom-input"
              label="years"
              min={1900}
              max={new Date().getFullYear()}
              type="number"
              name="years"
              value={data.personalInformation.years}
              onChange={(e) => {
                setData({ ...data, personalInformation: { ...data.personalInformation, years: e.target.value } });
              }}
              placeholder="years"
              tabIndex={9}
            />
          </FormControl>
          <label>age</label>
          <input
            value={data.personalInformation.age}
            onChange={(e) => setData({ ...data, personalInformation: { ...data.personalInformation, age: e.target.value } })}
            type="number"
            tabIndex={10}
            min={0}
            max={150}
            className="custom-input"
            placeholder="age"
          />
          <label>age type</label>
          <select
            className="custom-input"
            tabIndex={11}
            onChange={(e) =>
              setData({ ...data, personalInformation: { ...data.personalInformation, agetype: e.target.value } })
            }
            value={data.personalInformation.agetype}
          >
            <option value="years">years</option>
            <option value="months">months</option>
            <option value="days">days</option>
          </select>
          <FormControl
            style={{ display: "flex", justifyContent: "flex-start" }}
          >
            <label>occupation</label>
            <input
              label="occupation"
              type="text"
              placeholder="occupation"
              tabIndex={12}
              name="occupation"
              className='custom-input'
              value={data.personalInformation.occupation}
              onChange={(e) => {
                setData({ ...data, personalInformation: { ...data.personalInformation, occupation: e.target.value } });
              }}
            />
            <label>organization</label>
            <input
              label="patient organization"
              type="text"
              placeholder="patientOrganization"
              tabIndex={13}
              name="patientOrganization"
              className='custom-input'
              value={data.personalInformation.patientOrganization}
              onChange={(e) => {
                setData({ ...data, personalInformation: { ...data.personalInformation, patientOrganization: e.target.value } });
              }}
            />
            <FormLabel name="gender">Gender</FormLabel>
            <RadioGroup
              aria-labelledby="gender"
              defaultValue="female"
              name="gender"
              tabIndex={14}
              onChange={(e) => setData({ ...data, personalInformation: { ...data.personalInformation, gender: e.target.value } })}
              value={data.personalInformation.gender}
            >
              <div>
                <FormControlLabel
                  value="female"
                  control={<Radio />}
                  tabIndex={15}
                  label="Female"
                />
                <FormControlLabel
                  value="male"
                  control={<Radio />}
                  tabIndex={16}
                  label="Male"
                />
                <FormControlLabel
                  value="other"
                  control={<Radio />}
                  tabIndex={17}
                  label="Other"
                />
              </div>
            </RadioGroup>
          </FormControl>
          <FormControl>
            {/* marital status */}
            <FormLabel id="marital-status">Marital Status</FormLabel>
            <RadioGroup
              aria-labelledby="marital-status"
              defaultValue="single"
              tabIndex={18}
              name="maritalstatus"
              onChange={(e) =>
                setData({ ...data, personalInformation: { ...data.personalInformation, maritalstatus: e.target.value } })
              }
              value={data.personalInformation.maritalstatus}
            >
              <div>
                <FormControlLabel
                  value="single"
                  control={<Radio />}
                  tabIndex={19}
                  label="Single"
                />
                <FormControlLabel
                  value="married"
                  control={<Radio />}
                  tabIndex={20}
                  label="Married"
                />
              </div>
            </RadioGroup>
          </FormControl>
        </div>
      </div>

    </>
  )
}
