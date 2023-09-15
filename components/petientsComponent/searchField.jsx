import React, { useContext } from 'react'
import { PatientContext } from '../../pages/patients'
import BillingDatesView from './BillingDatesView';
import { customFetch } from '../Auth/customFetch';
import { Refresh } from '@mui/icons-material';

export default function SearchFieldPatients() {
  const springData = useContext(PatientContext);

  const { initials, updateInitials } = springData;

  const getTransactionDates = async function (patientid) {
    const getTrans = await customFetch(`patients/analytics/date?patientid=${patientid}`);
    const { statusCode, result } = getTrans;
    statusCode == 200 ? updateInitials({ ...initials, datesSource: result }) : updateInitials({ ...initials, datesSource: []})
  }

  return (
    <div>
      <div className='d-flex justify-content-around'>
        <input value={initials.query} className='form-control' placeholder='Please enter Patient membership code' type='number'
          maxLength={20} minLength={14}
          onChange={(ev) => updateInitials({ ...initials, query: parseInt(ev.target.value) })}
        />
        <button className='btn btn-dark btn-sm' style={{ marginLeft: '4px' }}
          onClick={(e) => { getTransactionDates(initials.query) }}
        >search</button>
      </div>
      <span className='text-capitalize text-dark lead'>
        Transaction Dates
        <Refresh />
      </span>
      <BillingDatesView source={initials.datesSource} />
    </div>
  )
}
