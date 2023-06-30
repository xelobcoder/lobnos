import React from 'react';
import { Typography } from '@mui/material';

export default function ClinicianView() {
  const data = {
    ID: 10,
    NAME: 'tiifu hammza',
    EMAIL: 'hamzatiifu45@gmail.com',
    LOCATION: 'popodpodpo',
    ADDRESS: 'Kalpohin Lowcost 30A',
    OCCUPATION: 'doctor',
    MODULE: 'mobile-money',
    MOMO: 241758550,
    BANKNAME: 'Access Bank',
    BANKBRANCH: '94949494949',
    ACCOUNTNUMBER: 2147483647,
    ACCOUNTNAME: 'Tiifu Hamza',
    ORGANIZATION: 0,
    UPDATE_ON: '2023-06-25T23:00:00.000Z',
    CREATED_ON: '2023-06-26T04:36:03.085Z',
    PHONE: 595964565,
    COMMISSION: 10,
  };

  return (
    <>
      <div className='clinician-view'>
        <div className='card'>
          <div className='card-header'>
            <Typography variant='h5'>
              <strong className='text-capitalize'>clinician details ( {data?.NAME}) </strong>
            </Typography>
          </div>
          <div className='card-body'>
            <div className='list-group-item'>
              <div>First Name</div>
              <div>{data.NAME}</div>
            </div>
            <div className='list-group-item'>
              <div>Email</div>
              <div>{data.EMAIL}</div>
            </div>
            <div className='list-group-item'>
              <div>Location</div>
              <div>{data.LOCATION}</div>
            </div>
            <div className='list-group-item'>
              <div>Address</div>
              <div>{data.ADDRESS}</div>
            </div>
            <div className='list-group-item'>
              <div>Occupation</div>
              <div>{data.OCCUPATION}</div>
            </div>
            <div className='list-group-item'>
              <div>Module</div>
              <div>{data.MODULE}</div>
            </div>
            <div className='list-group-item'>
              <div>Mobile Money</div>
              <div>{data.MOMO}</div>
            </div>
            <div className='list-group-item'>
              <div>Bank Name</div>
              <div>{data.BANKNAME}</div>
            </div>
            <div className='list-group-item'>
              <div>Bank Branch</div>
              <div>{data.BANKBRANCH}</div>
            </div>
            <div className='list-group-item'>
              <div>Account Number</div>
              <div>{data.ACCOUNTNUMBER}</div>
            </div>
            <div className='list-group-item'>
              <div>Account Name</div>
              <div>{data.ACCOUNTNAME}</div>
            </div>
            <div className='list-group-item'>
              <div>Organization:</div>
              <div>{data.ORGANIZATION}</div>
            </div>
            <div className='list-group-item'>
              <div>Update On:</div>
              <div>{data.UPDATE_ON}</div>
            </div>
            <div className='list-group-item'>
              <div>Created On:</div>
              <div>{data.CREATED_ON}</div>
            </div>
            <div className='list-group-item'>
              <div>Phone:</div>
              <div>{data.PHONE}</div>
            </div>
            <div className='list-group-item'>
              <div>Commission:</div>
              <div>{data.COMMISSION}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
