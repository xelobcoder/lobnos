import { useEffect, useState } from 'react'
import { customFetch, updatePagination } from '../../components/Auth/customFetch';
import ReadyList from '../../components/readyComponents/ReadyList';
import ResultFilterAdvancedSearch from '../../components/readyComponents/ResultFilterAdvancedSearch';
import DayTestSummary from '../../components/readyComponents/DayTestSummary';
import ReadyTestSummaryAccordion from '../../components/readyComponents/ReadyTestSummaryAccordion';
import Loader from '../../components/accessories/Loader';
import FrontDeskLayout from '../../components/Layout/FrontDeskLayout';


export default function ReadyResult() {
  const [showsummary, setShowSummary] = useState(true);
  const [loadpage, setLoadPage] = useState(false);
  const [pages, setPages] = useState({ count: 10, page: 1 })
  const [ready, setReady] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const [advanced, setAdvanced] = useState(true);
  const [showAccord, setShowAccord] = useState({ active: null, display: false, title: null });
  const [advancedQuery, setAdvancedQuery] = useState({ patientid: '', fullname: '', mobile: '', from: '', to: '' })


  const getWaitingList = async () => {
    try {
      setIsLoading(true);
      let queryparams = `ready/crm/summary/advanced?`;
      const insertToQuery = async function (object) {
        for (const key in object) {
          if (object[key] !== '') {
            queryparams += `${key}=${object[key]}&&`
          }
        }
      }
      await insertToQuery(advancedQuery);
      await insertToQuery(pages);
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
    if (!loadpage) getWaitingList();
  }, [])



  // change handler for advanced search
  const handleAdvancedChange = (e) => {
    setAdvancedQuery({ ...advancedQuery, [e.target.name]: e.target.value })
  }


  // submit handler for advanced search
  const handleAdvancedSubmit = async (e) => {
    e.preventDefault();
    const { fullname, patientid, from, to } = advancedQuery;
    if (patientid == "" && from == "" && to == "" && fullname == "") return;
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
          <ReadyList
            readydata={ready}
            showAccord={showAccord}
            load={setLoadPage}
            updateAccord={updateAccord}
            page={pages.page}
            updatePagination={updatePage}
          />
          {showAccord.display && <ReadyTestSummaryAccordion title={showAccord.title} id={showAccord.active} />}
        </section>
      )
    }
  }


  const updatePage = async (value) => {
    updatePagination(value, setPages, pages);
  }

  useEffect(() => {
    if (loadpage && pages.page) {
      getWaitingList(advancedQuery);
    }
    return () => null
  }, [pages,loadpage])





  return (
    <FrontDeskLayout>
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
    </FrontDeskLayout>
  )
}
