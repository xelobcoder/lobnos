import React, { useContext, useCallback } from 'react'
import { PatientContext } from '../../pages/patients'
import BillingDatesView from './BillingDatesView';
import { customFetch } from '../Auth/customFetch';
import { Refresh } from '@mui/icons-material';


export default function SearchFieldPatients() {
  const { initials, updateInitials } = useContext(PatientContext);


  const getTransactionDates = useCallback(async function (patientid) {
    const getTrans = await customFetch(`patients/analytics/date?patientid=${patientid}`);
    const { statusCode, result } = getTrans;
    updateInitials({ type: 'SEARCH_QUERY', result: statusCode == 200 ? result : []})
    if(statusCode == 401) {
     updateInitials({type: 'RESET_FILL_QUERY'}) 
    }
  }, [])

 


  return (
    <div>
      <div className='d-flex justify-content-around'>
        <input value={initials.query} className='form-control' placeholder='Please enter Patient membership code' type='number'
          maxLength={20} minLength={14}
          onChange={(ev) => updateInitials({ type: 'FILL_QUERY', fieldValue: parseInt(ev.target.value) })}
        />
        <button className='btn btn-dark btn-sm' style={{ marginLeft: '4px' }}
          onClick={(e) => { getTransactionDates(initials.query) }}
        >
          search
        </button>
      </div>
      <span className='text-capitalize text-dark lead'>
        Transaction Dates
        <Refresh />
      </span>
      <BillingDatesView source={initials.datesSource} />
    </div>
  )
}
