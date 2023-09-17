import React, { useState, createContext, useReducer } from 'react'
import SearchFieldPatients from '../../components/petientsComponent/searchField'
import TestsTable from '../../components/petientsComponent/TestsTable';
import SalesSummaryPatient from '../../components/petientsComponent/SalesSummaryPatient';
export const PatientContext = createContext();
const PatientProvider = PatientContext.Provider;

export default function PATIENTS_INDEX_PAGE() {
  const initialParams = {
    query: 2023854,
    selected: false,
    selectedValue: null,
    runprogressionRate: false,
    progressTestid: null,
    analytics: true,
    runComparisionFlow: false,
    comparisoncount: 0,
    view: 'list',
    datesSource: [],
    selectedBillingidTest: [],
    runBillingDates: function () {
      if (this.query && this.query.toString().length > 4) {
        return 'Allah is your creator';
      }
    },
    runSales: false,
    clientSalesSummaryGeneral: {
      week: 0,
      yearly: 0,
      month: 0,
      day: 0
    }
  }



  const [initials, updateInitials] = useReducer(Reducer, initialParams);


  function Reducer(state, action) {
    const { type } = action;
    switch (type) {
      case 'SEARCH_QUERY':
        return { ...state, datesSource: action.result, runSales: true }
      case 'FILL_QUERY':
        return { ...state, query: action.fieldValue }
      case 'POPULATE_SELECTED':
        const currentState = { ...state, selectedValue: action.selection, selected: true }
        return currentState;
      case 'POPULATE_TRANSACTION_TEST':
        return { ...state, selectedBillingidTest: action.result };
      case 'RESET_FILL_QUERY':
        return { ...state, selectedValue: null, selected: false, selectedBillingidTest: [] }
      case 'POPULATE_SALES_SUMMARY':
        return { ...state, clientSalesSummaryGeneral: action.data }
      default:
        return {}
    }
  }



  return (
    <>
      <PatientProvider value={{ initials, updateInitials }}>
        <div className='wrapper p-2 whitesmoke' style={{ height: '100vh' }}>
          <div className='p-2'>
            <SearchFieldPatients />
          </div>
          <div className='main p-2'>
            <SalesSummaryPatient currency={'$'} data={initials.clientSalesSummaryGeneral} header={'Financial Transaction Summary'} />
            <TestsTable />
          </div>
        </div>
      </PatientProvider>
    </>
  )
}

