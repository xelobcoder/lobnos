import React, { useState,useContext } from 'react';
import OperationsContext from './OperationsContext';
import { customFetch, handleComments, validateFormData } from '../Auth/customFetch'
import SECOND_NO_DATA from '../accessories/secondNodata';

export default function ResultEnteredSidePanel() {
  const [query, setQuery] = useState({ from: '', to: '', billingid: '', patientid: '' });
  const [collection, setCollection] = useState(([]));
  const { operationsKey, updateOperations } = useContext(OperationsContext)


  const submitData = async function () {
    const { from, to, billingid, patientid } = query;

    const response = await customFetch(`operations/collection/result?from=${from}&&to=${to}&&billingid=${billingid}&&patientid=${patientid}`);
    const { statusCode, status, result } = response;

    if (statusCode == 200 && status == 'success') {
      setCollection(result)
    }
  }

  const handleUpdate = (e, item) => { updateOperations({ billingid: item.BILLINGID, patientid: item.PATIENTID }) }


  console.log(operationsKey)


  return (
    <>
      <div>
        <h5 className='m-2 text-capitalize bold'>filter result</h5>
        <div className='m-2 bg-warning p-2 br-5'>
          <label> from</label>
          <input type='date' className='form-control' onChange={(e) => handleComments(e, query, 'from', setQuery)} />
          <label>to</label>
          <input type='date' className='form-control' onChange={(e) => handleComments(e, query, 'to', setQuery)} />
          <label>billing id</label>
          <input className='form-control' id='billingid' onChange={(e) => handleComments(e, query, 'billingid', setQuery)} />
          <label>patientid</label>
          <input className='form-control' id='billingid' onChange={(e) => handleComments(e, query, 'patientid', setQuery)} />
          <button className='btn btn-success btn-sm mt-2'
            onClick={(e) => { submitData() }}>search</button>
        </div>
        <ul>
          {collection.length > 0 ? (
            collection.map((item, index) => (
              <li
                tabIndex={1 + index}
                onClick={(e) => handleUpdate(e, item)}
                key={index}
              >
                {/* <BloodtypeIcon /> */}
                {item.FULLNAME} - {item.BILLINGID}
              </li>
            ))
          ) : (
            <SECOND_NO_DATA message={"No data"} />
          )}
        </ul>
      </div>
    </>
  )
}
