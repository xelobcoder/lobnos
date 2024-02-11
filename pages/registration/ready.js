import { useCallback, useEffect, useState } from 'react'
import { customFetch,  getDateExpression } from '../../components/Auth/customFetch';
import ReadyList from '../../components/readyComponents/ReadyList';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout';
import SidebarFrontPage from '../../components/frontpagesidebar';
import ResultFilterAdvancedSearch from '../../components/readyComponents/ResultFilterAdvancedSearch';
import DayTestSummary from '../../components/readyComponents/DayTestSummary';
import ReadyTestSummaryAccordion from '../../components/readyComponents/ReadyTestSummaryAccordion';
import Loader from '../../components/accessories/Loader';

export default function ReadyResult() {
  const [showsummary, setShowSummary] = useState(true);
  const [ready, setReady] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const [advanced, setAdvanced] = useState(true);
  const [showAccord, setShowAccord] = useState({ active: null, display: false, title: null });
  const [advancedQuery, setAdvancedQuery] = useState({ patientid: '', fullname: '', mobile: '', from: '', to: '' })


  const getWaitingList = async () => {
    try {
      setIsLoading(true);
      let queryparams = `ready/crm/summary/advanced?`;
      for (const key in advancedQuery) {
        if (advancedQuery[key] !== '') {
          queryparams += `${key}=${advancedQuery[key]}&&`
        }
      }
      const pushRequest = await customFetch(queryparams);
      const { status, statusCode, result } = pushRequest;
      if (status == 'success' && statusCode == 200) {
        setReady(result)
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setReady([]);
    }
  }


  useEffect(() => {
    getWaitingList();
  }, [])



  // change handler for advanced search
  const handleAdvancedChange = (e) => {
    setAdvancedQuery({ ...advancedQuery, [e.target.name]: e.target.value })
  }


  // submit handler for advanced search
  const handleAdvancedSubmit = async (e) => {
    e.preventDefault();
    getWaitingList();
  }


  const updateAccord = (data) => {
    const { billingid, fullname } = data;
    setShowAccord({ display: true, active: billingid, title: `${fullname}-----${billingid}` });
  }


  useEffect(() => {
    if (ready.length == 0 && showAccord.active) setShowAccord({ display: false, active: null });
  }, [ready, showAccord])


  const renderer = () => {
    if (isloading) {
      return <Loader />
    } else {
      return (
        <section className={`${showAccord.display ? "grid-50" : "grid-100"} mt-2`}>
          <ReadyList readydata={ready} showAccord={showAccord} updateAccord={updateAccord} />
          {showAccord.display && <ReadyTestSummaryAccordion title={showAccord.title} id={showAccord.active} />}
        </section>
      )
    }
  }

  return (
    <SettingsLayout sidebar={<SidebarFrontPage />}>
      <div className="mx-2">
        <div className="d-flex justify-content-between mt-1">
          <div>
            <button onClick={(ev) => { setShowAccord({ ...showAccord, display: false }) }} className='btn btn-danger btn-sm'>close details</button>
            <button
              className="btn btn-primary btn-sm mx-2"
              onClick={(ev) => {
                setShowSummary(!showsummary)
              }}>
              view day summary
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setAdvanced(!advanced)}>
              advanced search
            </button>
          </div>
        </div>

        {showsummary && <DayTestSummary />}
        {/* advanced query section */}
        {advanced && (
          <section className="mt-2">
            <ResultFilterAdvancedSearch
              advancedQuery={advancedQuery}
              handleAdvancedChange={handleAdvancedChange}
              handleAdvancedSubmit={handleAdvancedSubmit}
            />
          </section>
        )}
        {renderer()}
      </div>
    </SettingsLayout>
  )
}
