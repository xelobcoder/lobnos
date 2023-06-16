import React, { useEffect, useState } from 'react'
import Sampling from '../../components/readyComponents/Sampling'
import { Container, InputGroup } from 'react-bootstrap'
import { customFetch } from '../../components/Auth/customFetch';
import ReadyList from '../../components/readyComponents/ReadyList';
import ReadyTest from '../../components/readyComponents/ReadyTest';

export default function ReadyResult() {
  const [layout, setLayout] = useState('two');
  const [query, setQuery] = useState({ querydate: '', content: '' });
  const [ready, setReady] = useState([]);
  const [summaryArea, setSummaryArea] = useState([])
  const [dropdown, setDropdown] = useState(null)



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



  return (
    <div style={{ backgroundColor: "#f1f3f5", height: "100vh" }}>
      <div style={{margin:'0% 3%'}}>
        <InputGroup className="d-flex mt-2">
          <input className="form-control" type="date" value={query.querydate}
            onChange={(e) => setQuery({ ...query, querydate: e.target.value })}
          />
          <input
            className="form-control"
            placeholder="search client here with the client billingid"
            value={query.content}
            onChange={(e) => setQuery({ ...query, content: e.target.value })}
            type="text"
          />
        </InputGroup>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${layout == 'two' ? '20% auto' : "15% auto 25%"}`,
          paddingTop: "10px",
          gridGap: "20px",
          margin:'0% 3%'
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100%",
            gridGap: "10px 20px",
            height: "80vh",
          }}
        >
          {
            summaryArea.length > 0 && (
                summaryArea.map((item, index) => {
                  return <Sampling data={item}  key={index}/>
                })
            )
          }
        </div>
        <ReadyList changeLayout={changeLayout}
          readydata={ready}
        />
        {layout == 'three' && <ReadyTest id={dropdown} />}
      </div>
    </div>
  );
}
