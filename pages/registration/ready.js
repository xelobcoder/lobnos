import React, { useEffect, useState } from 'react'
import Sampling from '../../components/readyComponents/Sampling'
import { customFetch,  getDateExpression } from '../../components/Auth/customFetch';
import ReadyList from '../../components/readyComponents/ReadyList';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout';
import SidebarFrontPage from '../../components/frontpagesidebar';
import ResultFilterAdvancedSearch from '../../components/readyComponents/ResultFilterAdvancedSearch';

export default function ReadyResult() {
  const [layout, setLayout] = useState('two');
  const [query, setQuery] = useState({ querydate: getDateExpression, content: '' });
  const [ready, setReady] = useState([]);
  const [summaryArea, setSummaryArea] = useState([])
  const [advanced, setAdvanced] = useState(false);

  // data state for advanced search
  const [advancedQuery, setAdvancedQuery] = useState({ patientid: '', fullname: '', mobile: '', from: '', to: '' })



  useEffect(() => {
    const getReadyData = async function () {
      let response = await customFetch(`result/ready?querydate=${query.querydate}&&content=${query.content}`);
      const summary = await customFetch(`result/ready/crm/summary?querydate=${query.querydate}`);
      setReady(response)
      setSummaryArea(summary)
    }
    getReadyData()
  }, [query.querydate, query.content])



  // change handler for advanced search
  const handleAdvancedChange = (e) => {
    setAdvancedQuery({ ...advancedQuery, [e.target.name]: e.target.value })
  }


  // submit handler for advanced search
  const handleAdvancedSubmit = async (e) => {
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
  }


  return (
    <SettingsLayout sidebar={<SidebarFrontPage />}>
      <div className='container'>
        <div className='d-flex justify-content-between mt-1'>
         <h6 className='lims-text-color'>Summary for {query.querydate}</h6>
          <button
            className="btn btn-primary btn-sm mb-1"
            onClick={() => setAdvanced(!advanced)}
          >
            advanced search
          </button>
        </div>

        {/* summary section */}
        <div id='ready-summary-view'>
          {summaryArea.length > 0 &&
            summaryArea.map((item, index) => {
              return (
                <div key={index}>
                  <Sampling data={item} colorIndex={index} />
                </div>
              );
            })}
        </div>
        {/* advanced query section */}
        {advanced && (
          <section>
            <ResultFilterAdvancedSearch advancedQuery={advancedQuery} handleAdvancedChange={handleAdvancedChange} handleAdvancedSubmit={handleAdvancedSubmit} />
          </section>)}
        {/* <div
          className={layout == "two" ? "ready-panel-half" : "ready-panel-three"}
        > */}
        <ReadyList  readydata={ready} />
      </div>
    </SettingsLayout>
  );
}
