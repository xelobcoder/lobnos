import React, { useState } from 'react'
import Sampling from '../../components/readyComponents/Sampling'
import { Container, InputGroup } from 'react-bootstrap'
import ReadyList from '../../components/readyComponents/ReadyList';
import ReadyTest from '../../components/readyComponents/ReadyTest';
import style from '../../styles/ready.module.css'

export default function ReadyResult() {
  const [layout, setLayout] = useState('two')
  const [query, setQuery] = useState({ querydate: '', content: '' });

  const changeLayout = (target) => setLayout(target)
  return (
    <div style={{ backgroundColor: "#f1f3f5", height: "100vh" }}>
      <div className={style.mlr}>
        <InputGroup className="d-flex mt-2">
          <input className="form-control" type="date" value={query.querydate}
            onChange={(e) => setQuery({ ...query, querydate: e.target.value })}
          />
          <input
            className="form-control"
            placeholder="search client here"
            value={query.content}
            onChange={(e) => setQuery({ ...query, content: e.target.value })}
            type="text"
          />
        </InputGroup>
      </div>
      <div
        className={style.mlr}
        style={{
          display: "grid",
          gridTemplateColumns: `${layout == 'two' ? '20% auto' : "15% auto 15%"}`,
          paddingTop: "10px",
          gridGap: "20px",
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
          <Sampling data={{ title: "Registered", value: 30 }} />
          <Sampling data={{ title: "Sampling", value: 10 }} />
          <Sampling data={{ title: "Processing", value: 26 }} />
          <Sampling data={{ title: "Ready", value: 90 }} />
        </div>
        <ReadyList changeLayout={changeLayout}
          readydata={[
            1, 2, 3, 3, 4, 8, 9, 10, 8, 9, 10, 1, 2, 3, 3, 4, 8, 9, 10, 8, 9,
            10, 1, 2, 3, 3, 4, 8, 9, 10, 8, 9, 10, 1, 2, 3, 3, 4, 8, 9, 10, 8,
            9, 10,
          ]}
        />
        {layout == 'three' && <ReadyTest />}
      </div>
    </div>
  );
}
