import React, { useState, createContext } from 'react'
import SearchFieldPatients from '../../components/petientsComponent/searchField'
import TestsTable from '../../components/petientsComponent/TestsTable';
export const PatientContext = createContext();
const PatientProvider = PatientContext.Provider;

export default function PATIENTS_INDEX_PAGE() {
  const initialParams = {
    query: 2023854,
    selected: true,
    selectedValue: null,
    runprogressionRate: false,
    progressTestid: null,
    analytics: true,
    runComparisionFlow: false,
    comparisoncount: 0,
    view: 'list',
    datesSource:[],
    selectedBillingidTest: [],
    runBillingDates: function () {
      if (this.query && this.query.toString().length > 4) {
        return 'Allah is your creator';
      }
    }
  }


  const [initials, setInitials] = useState(initialParams);
  // update the context initial values 
  const updateInitials = (value) => setInitials(value);

  return (
    <>
      <PatientProvider value={{ initials, updateInitials }}>
        <div className='wrapper p-2 whitesmoke'>
          <div className='p-2'>
            <SearchFieldPatients />
          </div>
          <div className='main p-2'>
           <TestsTable/>
          </div>
        </div>
      </PatientProvider>
    </>
  )
}

