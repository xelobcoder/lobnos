import React, { useContext } from 'react'
import { PatientContext } from '../../pages/patients'
import BillingDatesView from './BillingDatesView';
import { Refresh } from '@mui/icons-material';
export default function SearchFieldPatients() {
  const springData = useContext(PatientContext);

  const { initials, updateInitials } = springData;

  console.log(initials.query)
  return (
    <div>
      <label>membership code</label>
      <input value={initials.query} className='form-control' placeholder='Please enter Patient membership code' type='number'
        maxLength={20} minLength={14}
        onChange={(ev) => updateInitials({ ...initials, query: ev.target.value })}
      />
      <span className='text-capitalize text-dark '>
        Transaction Dates
        <Refresh/>
      </span>
      <BillingDatesView source={initials.datesSource} />
    </div>
  )
}
