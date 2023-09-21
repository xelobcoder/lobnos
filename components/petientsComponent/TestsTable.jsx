import React, { useState, useContext, useEffect, useRef } from 'react';
import { PatientContext } from '../../pages/patients';
import { customFetch } from '../Auth/customFetch';
import { Menu } from '@mui/icons-material';
import TableTrPatient from './TableTrPatient';
import NotSelected from './NotSelected';
import OptionsTrackClient from './OptionsTrackClient';


export default function TestsTable() {
  const { initials, updateInitials } = useContext(PatientContext);
  const { selected, selectedValue } = initials;
  const data = initials.selectedBillingidTest;
  const TrackRef = useRef(null);

  const testStatus = async function (id) {
    const response = await customFetch(`testpanel/list/update?billingid=${id}`);
    const { statusCode, result } = response;
    updateInitials({ type: 'POPULATE_TRANSACTION_TEST', result: statusCode == 200 ? result : [] });
  };

  useEffect(() => {
    if (selected === true && selectedValue) {
      testStatus(selectedValue);
    }
  }, [selected, selectedValue]);

  const openModal = () => {
    TrackRef.current.handleShow;
  };

  return (
    <>
      {selected && selectedValue ? (
        <div className='bg-white p-2'>
          <button className='btn btn-light' onClick={(ev) => {
            console.log('hkkk')
            testStatus(selectedValue)
          }}>refresh</button>
          <h5 className='text-warning text-capitalize'>Transaction test records</h5>
          <table className='table'>
            <thead className='table-secondary text-capitalize br-7'>
              <tr>
                <th>#</th>
                <th>billing id</th>
                <th>test name</th>
                <th>sample</th>
                <th>processed</th>
                <th>result ready</th>
                <th>result approved</th>
                <th>action</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 && (
                data.map((item, index) => (
                  <TableTrPatient openModal={openModal} key={index} index={index} item={item} />
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <NotSelected message={'select a transaction date to continue'} />
      )}
      <OptionsTrackClient ref={TrackRef} />
    </>
  );
}
