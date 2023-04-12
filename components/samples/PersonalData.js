import React, { useState } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Image from 'next/image';
import { Avatar } from '@mui/material';

export default function PersonalData({ data }) {
  const sampleData = {
    "ID": ' XXXXXXXX',
    "PATIENTID": 'XXXXXXXXXXXXXXXX',
    "TEST": "Renal Function Test",
    "DATE": "2023-02-19T00:00:00.000Z",
    "URGENCY": "moderate",
    "BILLINGID": 'XXX',
    "SAMPLING_CENTER": "Zonal Bridge B",
    "SAMPLE_STATUS": "REJECTED",
    "INSPECTOR": "Dr Tiifu Hamza",
    "INSPECTION_TIME": "2023-03-01T19:55:15.000Z",
    "PHELOBOTOMY_STATUS": "QUEUE",
    "SAMPLE_TAKEN_BY": null,
    "TIME_PHELOBOTOMY_COMPLETED": null,
    "ALL_SAMPLE_TAKEN": "FALSE",
    "MESSAGE": "MSJJDJ",
    "TIME": "06:38:29.000000",
    "PHELOBOTOMY_MESSAGE": "",
    "FULLNAME": "Mr sample name Goerge",
    "EMAIL": "tiifuofficial@gmail.com",
    "DOB": "1995-11-06T00:00:00.000Z",
    "AGE": 27,
    "GENDER": "male",
    "ORGANIZATION": "",
    "CLINICIAN": "",
    "PATIENTTYPE": "Direct",
    "LOCATION": null,
    "MARITAL_STATUS": "married",
    "EMMERGENCY_CONTACT": "0595964566",
    "EMMERGENCY_CONTACT_NAME": "Tiifu hamza",
    "RELATIONSHIP": "brother",
    "MOBILE_NUMBER": 595964566,
    "AGETYPE": "years",
    "PATIENTORGANIZATION": "leonides",
    "OCCUPATION": "Nursing",
    "ACTIVATION_STATUS": "TRUE"
  }

  const {
    PATIENTID,
    FIRSTNAME,
    LASTNAME,
    MIDDLENAME,
    ID,
    EMAIL,
    GENDER,
    AGE,
    MOBILE_NUMBER,
    ACTIVATION_STATUS,
    TIME_PHELOBOTOMY_COMPLETED,
    MARITAL_STATUS,
    DATE,
    INSPECTOR,
    SAMPLE_TAKEN_BY,
    INSPECTION_TIME,
    ALL_SAMPLE_TAKEN,
    LOCATION,
    OCCUPATION,
    BILLINGID,
    ORGANIZATION
  } = data[0] || sampleData;

  const genderState = {
    male: '/../public/male-profile-pic.jpeg',
    female: '/../public/female-profile-pic.jpeg'
  }
  return (
    <div className='rejected-sample-overhead-for-avatar'>
      <div className='avatar-placeholder'>
        <div className='avatar'>
          <Image src={GENDER === 'male' ? genderState.male : genderState.female}
            style={{ borderRadius: '50%' }}
            width={200} height={200} alt='profile image placeholder'></Image>
        </div>
        <h1 id='header-rejection'>personal Data</h1>
        <div className='rejected-personal-details'>
          <div className='list-group'>
            <div className='list-group-item'>
              <div className='leader'>
                fullname
              </div>
              <div className='follower text-success'>
                {FIRSTNAME} {MIDDLENAME} {LASTNAME}
              </div>
            </div>
            <div className='list-group-item'>
              <div className='leader'>
                Billing ID
              </div>
              <div className='follower text-danger'>
                {BILLINGID}
              </div>
            </div>
            <div className='list-group-item'>
              <div className='leader'>
                Email
              </div>
              <div className='follower text-success'>
                {EMAIL}
              </div>
            </div>
            <div className='list-group-item'>
              <div className='leader'>
                patientID
              </div>
              <div className='follower text-danger'>
                {PATIENTID}
              </div>
            </div>
            <div className='list-group-item'>
              <div className='leader'>
                Phone number
              </div>
              <div className='follower text-success'>
                0{MOBILE_NUMBER}
              </div>
            </div>
            <div className='list-group-item'>
              <div className='leader'>
                Marital status
              </div>
              <div className='follower text-success'>
                {MARITAL_STATUS}
              </div>
            </div>
            <div className='list-group-item'>
              <div className='leader'>
                location
              </div>
              <div className='follower text-success'>
                {LOCATION}
              </div>
            </div>
            <div className='list-group-item'>
              <div className='leader'>
                Occupation
              </div>
              <div className='follower text-success'>
                {OCCUPATION}
              </div>
            </div>
            <div className='list-group-item'>
              <div className='leader'>
                organization
              </div>
              <div className='follower text-success'>
                {ORGANIZATION}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='sample-questions'>
        <h5><HelpOutlineIcon color='primary' fontSize='small' /> activated for service :
          <span id='sample-question-span' className={ACTIVATION_STATUS === 'TRUE' ? 'text-success' : 'text-danger'}>
            {ACTIVATION_STATUS}
          </span>
        </h5>
        <h5><HelpOutlineIcon color='primary' fontSize='small' />  registration date: {DATE.slice(0, 10)} </h5>
        <h5><HelpOutlineIcon color='primary' fontSize='small' />  Phelobotomist : {'Null' || SAMPLE_TAKEN_BY}</h5>
        <h5><HelpOutlineIcon color='primary' fontSize='small' /> activation datetime: </h5>
        <h5><HelpOutlineIcon color='primary' fontSize='small' />  sample inspection datetime: {INSPECTION_TIME.slice(0, 16)} </h5>
        <h5><HelpOutlineIcon color='primary' fontSize='small' />  sample inspector : {INSPECTOR}</h5>
        <h5><HelpOutlineIcon color='primary' fontSize='small' />  phelobotomy completion time: {"Not recorded" || TIME_PHELOBOTOMY_COMPLETED}</h5>
        <h5><HelpOutlineIcon color='primary' fontSize='small' />  was all sample taken: <span id='sample-question-span' className={ALL_SAMPLE_TAKEN == 'FALSE' ? 'text-danger p-1' : 'text-success'}>{ALL_SAMPLE_TAKEN}</span></h5>
      </div>
    </div>
  )
}


