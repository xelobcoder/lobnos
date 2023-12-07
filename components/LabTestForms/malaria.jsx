import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Indicator from '../accessories/Reports/indicator'
import CommentSection from './commentSection'
import { CheckResultEntered, handleComments, validateFormData,handleResponse, getHematologicalResultEntered } from '../Auth/customFetch'
import { toast,ToastContainer } from 'react-toastify'
import ISLOADING from '../isLoading'

export default function Malaria({ clientdata, employeeid }) {
  const {billingid, test, testid, patientid} = clientdata;
  const [resultEntered, setResultEntered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ parasitenumber: 0, species: '', comments: '' })

  const handleResult = async function () {
    await validateFormData({ ...data, billingid, testname: test, testid, patientid, employeeid }, true, [], 'test/result/enter', handleResponse);
  }


  const getPreviousResult = useCallback(async () => {
    getHematologicalResultEntered(billingid, test, setLoading, setData, setResultEntered);
  }, [billingid, test]);

  useEffect(() => {
    getPreviousResult();
  }, [getPreviousResult])

  console.log(data);
  return (
    <div className="mx-3">
      <ToastContainer/>
      <div className="card">
        <div className="card-header modal-color">
          <h4>Malaria test</h4>
          <Indicator resultEntered={resultEntered} />
        </div>
        <div className='card-body'>
          {loading && <ISLOADING />}
          {!loading && (
            <>
            <div className="form-group">
            <label>parasite present </label>
            <input
              type="number"
              className="custom-input"
              placeholder="number of parasite seen"
              required
              value={data.parasitenumber}
              onChange={(e) => setData({ ...data, parasitenumber: e.target.value })}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
