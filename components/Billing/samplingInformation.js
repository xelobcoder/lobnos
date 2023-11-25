import React, { useEffect, useState, useCallback } from 'react'
import ISLOADING from '../isLoading';
import { getDataAndUpdateState } from '../Auth/customFetch';

export default function SamplingInformation({ source, id }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const getAscensionInformation = useCallback(async (id) => {
    try { getDataAndUpdateState(setData, `phelobotomy/ascension?billingid=${id}&&state='true'`); setLoading(false) } catch (err) { console.log(err) };
  }, [])

  useEffect(() => {
    if (id) { getAscensionInformation(id) }
  }, [id])

  console.log(data[2])

  return (
    <div>
      {(loading && data.length === 0) ? <ISLOADING /> : (
        <div className='card my-3'>
          <div className='card-header'>
            <h4>Sampling information</h4>
          </div>
          <div className='card-body'>
            <table className='billing-cart-table'>
              <thead>
                <tr>
                  <th>test</th>
                  <th>collection</th>
                  <th>collection date</th>
                  <th>collection time</th>
                  <th>validation date</th>
                  <th>sampling message</th>
                  <th>status</th>
                  <th>rejection msg</th>
                  <th>disputed</th>
                  <th>disputed on</th>
                  <th>dispute reason</th>
                  <th>action plan</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className={`${(item?.collection == 'true' && item?.approvalstatus == 1) ? 'text-success':'text-danger'}`}>
                    <td>{item.name}</td>
                    <td>{item.collection == "false" ? 'Not collected' : 'collected'}</td>
                    <td>{new Date(item.collection_date).toLocaleDateString()}</td>
                    <td>{new Date(item?.collection_date).toLocaleTimeString()}</td>
                    <td>{item?.samplevalidatedon != null ? new Date(item.samplevalidatedon).toLocaleDateString() : 'None'}</td>
                    <td>{item?.samplemessage}</td>
                    <td>
                      {(item.approvalstatus == 0 && item.rejectionmessage == null) && 'awaiting approvall'}
                      {(item.approvalstatus == 0 && item.rejectionmessage != null) && 'Rejected'}
                      {(item.approvalstatus == 1) && 'Approved'}
                    </td>
                    <td>{item.rejectionmessage}</td>
                    <td>{item.disputed}</td>
                    <td>{item.disputedon != null ? new Date(item.disputedon).toLocaleDateString() : 'None'}</td>
                    <td>{item.disputereason}</td>
                    <td>{item.actionplan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {(!loading && data.length === 0) && (<h1 className='d-flex justify-content-center align-content-center'>No sampling information found</h1>)}
    </div>
  )
}
