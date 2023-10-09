import React, { useEffect, useState } from 'react'
import Sampling from '../../components/readyComponents/Sampling'
import { customFetch, customPost, getDateExpression } from '../../components/Auth/customFetch';
import ReadyList from '../../components/readyComponents/ReadyList';
import ReadyTest from '../../components/readyComponents/ReadyTest';
import { Typography } from '@mui/material';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout';
import SidebarFrontPage from '../../components/frontpagesidebar';

export default function ReadyResult() {
  const [layout, setLayout] = useState('two');
  const [query, setQuery] = useState({ querydate: getDateExpression, content: '' });
  const [ready, setReady] = useState([]);
  const [summaryArea, setSummaryArea] = useState([])
  const [dropdown, setDropdown] = useState(null);
  const [advanced, setAdvanced] = useState(false);

  // data state for advanced search
  const [advancedQuery, setAdvancedQuery] = useState({ patientid: '', fullname: '', mobile: '', from: '', to: '' })



  useEffect(() => {
    const getReadyData = async function () {
      let response = await customFetch(`result/ready?querydate=${query.querydate}&&content=${query.content}`);
      const summary = await customFetch(`result/ready/crm/summary?querydate=${query.querydate}`);
      setLayout('two')
      setReady(response)
      setSummaryArea(summary)
    }
    getReadyData()
  }, [query.querydate, query.content])

  const changeLayout = (target, item) => { setLayout(target); setDropdown(item) }


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
      setLayout('two');
    }
  }


  return (
    <SettingsLayout sidebar={<SidebarFrontPage />}>
      <div>
        <Typography variant='h5' className='text-lead text-dark' sx={{ margin: '0px 10px 0px 10px' }}>
          Summary for {query.querydate}
        </Typography>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6,1fr)",
            gridGap: "5px",
          }}
        >
          {summaryArea.length > 0 &&
            summaryArea.map((item, index) => {
              return (
                <div key={index}>
                  <Sampling data={item} colorIndex={index} />
                </div>
              );
            })}
        </div>
        <div
          className={layout == "two" ? "ready-panel-half" : "ready-panel-three"}
        >
          <div>
            <Typography
              variant="h5"
              className="btn btn-primary mb-1"
              onClick={() => setAdvanced(!advanced)}
            >
              advanced search
            </Typography>
            <br />
            {!advanced && (
              <>
                <input
                  className="form-control"
                  type="date"
                  value={query.querydate}
                  placeholder="query with date here"
                  onChange={(e) =>
                    setQuery({ ...query, querydate: e.target.value })
                  }
                />
              </>
            )}
            {advanced && (
              <>
                <label>patient id</label>
                <input
                  className="form-control mb-2"
                  value={advancedQuery.patientid}
                  name="patientid"
                  type='number'
                  onChange={(e) => handleAdvancedChange(e)}
                  placeholder="Type client patientid here eg. 48493927390"
                />
                <label>fullname</label>
                <input
                  className="form-control mb-2"
                  value={advancedQuery.fullname}
                  name="fullname"
                  onChange={(e) => handleAdvancedChange(e)}
                  placeholder="Type client fullname like Tiifu Hamza "
                />
                <label>mobile number</label>
                <input
                  className="form-control mb-2"
                  value={advancedQuery.mobile}
                  name="mobile"
                  type='tell'
                  onChange={(e) => handleAdvancedChange(e)}
                  placeholder="Type patient mobile number here"
                />
                <label>from</label>
                <input type="date" className="form-control"
                  value={advancedQuery.from}
                  name="from"
                  onChange={(e) => handleAdvancedChange(e)}
                />
                <label>To</label>
                <input type="date" className="form-control"
                  value={advancedQuery.to}
                  name="to"
                  onChange={(e) => handleAdvancedChange(e)}
                />
                <button className="btn btn-primary mt-2"
                  onClick={(e) => handleAdvancedSubmit(e)}
                >
                  search
                </button>
              </>
            )}
          </div>
          <ReadyList changeLayout={changeLayout} readydata={ready} />
          <div>{layout == "three" && <ReadyTest id={dropdown} />}</div>
        </div>
      </div>
    </SettingsLayout>
  );
}
