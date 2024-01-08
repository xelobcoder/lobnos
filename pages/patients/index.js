import React, { useState, createContext, useReducer } from 'react'
import SearchFieldPatients from '../../components/petientsComponent/searchField'
import TestsTable from '../../components/petientsComponent/TestsTable';
import SalesSummaryPatient from '../../components/petientsComponent/SalesSummaryPatient';
export const PatientContext = createContext();
const PatientProvider = PatientContext.Provider;
import dynamic from 'next/dynamic';
import { Link } from '@mui/material';
import PreviewPatientInformation from '../../components/petientsComponent/PreviewPatientInformation';
import PerformanceChartGeneral from '../../components/salesSummary/PerformanceChartGeneral';

export default function PATIENTS_INDEX_PAGE() {
  const initialParams = {
    query: 2023854,
    runquery: false,
    selected: false,
    selectedValue: null,
    runprogressionRate: false,
    progressTestid: null,
    analytics: true,
    runComparisionFlow: false,
    comparisoncount: 0,
    view: 'list',
    displayChart: false,
    chartTarget: null,
    chartData: {},
    rerunChart: false,
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
        return { ...state, datesSource: action.result, runSales: true, runquery: true }
      case 'FILL_QUERY':
        return { ...initialParams, query: action.fieldValue }
      case 'POPULATE_SELECTED':
        const currentState = { ...state, selectedValue: action.selection, selected: true }
        return currentState;
      case 'POPULATE_TRANSACTION_TEST':
        return { ...state, selectedBillingidTest: action.result };
      case 'RESET_FILL_QUERY':
        return { ...state, selectedValue: null, selected: false, selectedBillingidTest: [] }
      case 'POPULATE_SALES_SUMMARY':
        return { ...state, clientSalesSummaryGeneral: action.data }
      case 'RENDER_CHART':
        return { ...state, displayChart: true, chartTarget: action.target, rerunChart: true }
      case 'POPULATE_CHART_DATA':
        return { ...state, chartData: action.data }
      default:
        return {}
    }
  }



  return (
    <>
      <PatientProvider value={{ initials, updateInitials }}>
        <div className='wrapper  whitesmoke' style={{ height: '100vh' }}>
          <div className='p-2'>
            <SearchFieldPatients />
          </div>
          <div className='main container'>
            <ul >
              <Link href='/patients/records' >patient records</Link>
              <a onClick={(ev) => {window.open(`/patients/${initials.query}`)}} >update records</a>
              <Link href={`/patients/${initials.query}/notifications`}>Notification settings</Link>
              <Link href={`/patients/${initials.query}/resultsettings`}>Email preference</Link>
            </ul>
            {
              initials.runquery && <PreviewPatientInformation patientid={initials.query} />
            }
            <SalesSummaryPatient currency={'$'} data={initials.clientSalesSummaryGeneral} header={'Financial Transaction Summary'} />
            <div>
              <TestsTable />
            </div>
            <div className='mt-2 mb-2'>
              {initials.displayChart && <PerformanceChartGeneral subtarget={initials.chartTarge}  branchid={"all"} target={initials.chartTarget} rawData={initials.chartData?.[initials.chartTarget]} />}
            </div>
          </div>
        </div>
      </PatientProvider>
    </>
  )
}

