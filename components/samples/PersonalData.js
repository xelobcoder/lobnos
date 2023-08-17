import React, { useState } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Image from 'next/image';
import { Avatar, Typography } from '@mui/material';

export default function PersonalData({ data }) {
  const sampleData = [{
    activationStatus: "TRUE",
    age: 23,
    agetype: "years",
    bilingid: 44,
    date: "2023-08-10T23:00:00.000Z",
    fullname: "tiifu   hamza",
    gender: "female",
    inspectionTime: "16:24:53.000000",
    maritalStatus: "single",
    mobileNumber: "0595964565",
    phelobotomist: null,
    samplingCenter: 0,
    urgency: "none",
  }];

  const {
    patientid, fullname, mobileNumber, samplingCenter, urgency, email,
    maritalStatus, phelobotomist, gender, date, billingid, activationStatus, inspectionTime
  } = data[0] || sampleData [0];


  console.log(data)

  const genderState = {
    male: '/../public/male-profile-pic.jpeg',
    female: '/../public/female-profile-pic.jpeg'
  }
  return (
    <div className='rejected-sample-overhead-for-avatar'>
      <div className='avatar-placeholder'>
        <div className='avatar'>
          <Image src={gender === 'male' ? genderState.male : genderState.female}
            style={{ borderRadius: '50%' }}
            width={100} height={100} alt='profile image placeholder'></Image>
        </div>

        <div className='rejected-personal-details mt-2'>
          <div className='card br-5'>
            <div className='card-header'>
              <Typography variant='h5' className='btn btn-danger'>
                Personal Data
              </Typography>
            </div>
            <div className='card-body p-0'>
              <div className='list-group-item p-2'>
                <div className='leader'>
                  fullname
                </div>
                <div className='follower text-success'>
                  {fullname}
                </div>
              </div>
              <div className='list-group-item p-2'>
                <div className='leader'>
                  Billing ID
                </div>
                <div className='follower text-danger'>
                  {billingid}
                </div>
              </div>
              <div className='list-group-item p-2'>
                <div className='leader'>
                  Email
                </div>
                <div className='follower text-success'>
                  {email || 'N/A'}
                </div>
              </div>
              <div className='list-group-item p-2'>
                <div className='leader'>
                  patientID
                </div>
                <div className='follower text-danger'>
                  {patientid}
                </div>
              </div>
              <div className='list-group-item p-2'>
                <div className='leader'>
                  Phone number
                </div>
                <div className='follower text-success'>
                  {mobileNumber}
                </div>
              </div>
              <div className='list-group-item p-2'>
                <div className='leader'>
                  Marital status
                </div>
                <div className='follower text-success'>
                  {maritalStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='sample-questions mt-2'>
        <div className='card br-5'>
          <div className='card-header'>
            <Typography variant='h5' className='btn btn-danger'>
              sampling information
            </Typography>
          </div>
          <div className='card-body'>
            <h5><HelpOutlineIcon color='primary' fontSize='small' /> activated for service :
              <span id='sample-question-span' className={activationStatus === 'TRUE' ? 'text-success' : 'text-danger'}>
                {activationStatus == 'TRUE' ? 'Activated' : 'Deactivated'}
              </span>
            </h5>
            <h5><HelpOutlineIcon color='primary' fontSize='small' />  registration date: {date.slice(0, 10)} </h5>
            <h5><HelpOutlineIcon color='primary' fontSize='small' />  Phelobotomist : {'Null' || phelobotomist}</h5>
            <h5><HelpOutlineIcon color='primary' fontSize='small' /> activation datetime: </h5>
            <h5><HelpOutlineIcon color='primary' fontSize='small' />  sample inspection datetime: {inspectionTime.slice(0, 16)} </h5>
          </div>
        </div>
      </div>
    </div>
  )
}


