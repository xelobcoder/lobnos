import React, { useState, useMemo, useEffect } from 'react'
import Indicator from '../accessories/Reports/indicator'
import CommentSection from './commentSection'
import { CheckResultEntered, handleComments, validateFormData } from '../Auth/customFetch'
import { Button } from '@mui/material';

export default function Malaria({ clientdata }) {
  const [resultEntered, setResultEntered] = useState(false);
  const [data, setData] = useState({ number: 0, species: '', comments: '' })

  const handleResult = async function () {
    await validateFormData(
      {
        ...data,
        testname: clientdata.test,
        testid: clientdata.testid,
        patientid: clientdata.patientid,
        billingid: clientdata.billingid
      },
      true,
      [],
      "test/result/enter",
      function (response) {
        const { status, message } = response;
        if (status == 'success') {
          setResultEntered(true)
        }
        alert(message)
      }
    );
  }


  useEffect(() => {
    async function check() {
      const response = await CheckResultEntered(clientdata.test, clientdata.billingid);
      const { result, message, statusCode, records } = response;
      if (result == true) {
        setResultEntered(true);
        if (records.length != 0) {
          const number = records[0]['PARASITENUMBER']
          const species = records[0]['SPECIES'];
          const comments = records[0]['COMMENTS'];
          setData({
            number,
            species,
            comments
          })
        }
      }
    }
    check()
  }, [])

  return (
    <div className="mx-3">
      <div className="card">
        <div className="card-header modal-color">
          <h4>Malaria test</h4>
          <Indicator resultEntered={resultEntered} />
        </div>
        <div className='card-body'>
          <div className="form-group">
            <label>parasite present </label>
            <input
              type="number"
              className="custom-input"
              placeholder="number of parasite seen"
              required
              value={data.number}
              onChange={(e) => setData({ ...data, number: e.target.value })}
            />
          </div>
          <div className="form-group mt-2">
            <label>Select species here</label>
            <select value={data.species} className="custom-input" onChange={(e) => setData({ ...data, species: e.target.value })}>
              <option value="">select an option here</option>
              <option value={"Falciparum"}> plasmodium Falciparum</option>
              <option value={"ovalex"}>plasmodium ovalex</option>
              <option value={"vivax"}>plasmodium vivax</option>
            </select>
          </div>
          <CommentSection getcomment={handleComments} value={data.comments} datasource={data} datafunction={setData} target={"comments"} />
          <button  className="mx-1 my-2 btn btn-sm btn-primary" onClick={handleResult}>
            save result
          </button>
        </div>
      </div>
    </div>
  );
}
