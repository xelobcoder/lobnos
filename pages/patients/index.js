import React, { useState, createContext } from 'react'
import SearchFieldPatients from '../../components/petientsComponent/searchField'
export const PatientContext = createContext();
const PatientProvider = PatientContext.Provider;

export default function PATIENTS_INDEX_PAGE() {
  const initialParams = {
    query: 0,
    selected: true,
    selectedValue: null,
    runprogressionRate: false,
    progressTestid: null,
    analytics: true,
    runComparisionFlow: false,
    comparisoncount: 0,
    view: 'list',
    datesSource: [
      { date: "2023-09-14T10:24:19.201Z"},
      { date: "2023-09-14T10:24:19.201Z"},
      { date: "2023-09-14T10:24:19.201Z"},
      { date: "2023-09-14T10:24:19.201Z"},
      { date: "2023-09-14T10:24:19.201Z"},
      { date: "2023-09-14T10:24:19.201Z"},
      { date: "2023-09-14T10:24:19.201Z"},
      { date: "2023-09-14T10:24:19.201Z"},
      { date: "2023-09-14T10:24:19.201Z"}
    ],
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
        <div className='wrapper p-2'>
          <div className='p-2'>
            <SearchFieldPatients />
          </div>
          <div className='main p-2'>
            jife89pggleo78gwef9p84ioroiihirgphorb4rg
            pogpk3iog3ogio3go3ioooiogioogwiogoiwoow4
            ieggigiigwiiefwdklivuosgwpogvpoefogq3ro
          </div>
        </div>
      </PatientProvider>
    </>
  )
}

