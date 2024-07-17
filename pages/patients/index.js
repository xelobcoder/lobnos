import { useState, useReducer } from 'react'
import SearchFieldPatients from '../../components/petientsComponent/searchField'
import TestsTable from '../../components/petientsComponent/TestsTable';
import SalesSummaryPatient from '../../components/petientsComponent/SalesSummaryPatient';
import Header from '../../components/header';
import PreviewPatientInformation from '../../components/petientsComponent/PreviewPatientInformation';
import PerformanceChartGeneral from '../../components/salesSummary/PerformanceChartGeneral';

export default function PATIENTS_INDEX_PAGE() {
  const [query, setQuery] = useState('');
  const [TransactionSelected, setSelected] = useState({ state: false, billingid: '', date: '' });
  const initialParams = {
    query: 2024220121,
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



  const updatesearchValue = (ev) => {
    setQuery(ev.target.value);
  }

  const updateSelection = (value) => {
    const { TransactionId, TransactionsDate } = value;
    setSelected({ billingid: TransactionId, state: true, date: TransactionsDate })
  }

  return (
    <>
      <Header />
      <div className='d-flex justify-content-between'>
        <div className='p-2 col-2' style={{ position: 'static' }}>
          <SearchFieldPatients updatesearchValue={updatesearchValue} updateSelection={updateSelection} />
          </div>
        <div className='main container'>
          {query.length > 7 && (
            <section>
              <PreviewPatientInformation patientid={query} />
              <button className='btn btn-primary btn-sm mx-2' style={{ position: 'absolute', top: '60px', left: '80%' }} onClick={(ev) => window.open(`/patients/update?patientid=${query}`)}>
                update patient records
              </button>
            </section>
          )}

            <SalesSummaryPatient currency={'$'} data={initials.clientSalesSummaryGeneral} header={'Financial Transaction Summary'} />
            <div>
            {TransactionSelected.state === true && TransactionSelected.billingid && <TestsTable billingid={TransactionSelected.billingid} />}
            </div>
            <div className='mt-2 mb-2'>
              {initials.displayChart && <PerformanceChartGeneral subtarget={initials.chartTarge}  branchid={"all"} target={initials.chartTarget} rawData={initials.chartData?.[initials.chartTarget]} />}
            </div>
          </div>
      </div>
    </>
  )
}

