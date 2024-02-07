import React, { useEffect, useState, useCallback } from 'react'
import ISLOADING from '../isLoading';
import { getDataAndUpdateState } from '../Auth/customFetch';

export default function SamplingInformation({ id }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const getAscensionInformation = useCallback(async () => {
    try { getDataAndUpdateState(setData, `phelobotomy/ascension?billingid=${id}&&state='true'`); setLoading(false) } catch (err) { console.log(err) };
  }, [id])

  useEffect(() => {
    getAscensionInformation()
  }, [getAscensionInformation])



  return (
    <div>
      {(loading && data.length === 0) ? <ISLOADING /> : (
        <div className='card my-3'>
          <div className='card-header bg-secondary text-white'>
            <h5>Sampling information</h5>
          </div>
          <div className='card-body overflow-scroll'>
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
                  <th>rejection message</th>
                  <th>disputed</th>
                  <th>disputed on</th>
                  <th>dispute reason</th>
                  <th>action plan</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className={`${(item?.collection == 'true' && item?.approvalstatus == 1) ? 'text-success':'text-danger'}`}>
                    <td className='p-3'>{item.name}</td>
                    <td className='p-3'>{item.collection == "false" ? 'Not collected' : 'collected'}</td>
                    <td className='p-3'>{item.collection == 'false' ? 'N/A' : new Date(item.collection_date).toLocaleDateString()}</td>
                    <td className='p-3'>{item.collection == 'false' ? 'N/A' : new Date(item?.collection_date).toLocaleTimeString()}</td>
                    <td className='p-3'>{item?.samplevalidatedon != null ? new Date(item.samplevalidatedon).toLocaleDateString() : 'None'}</td>
                    <td className='p-3'>{item?.samplemessage}</td>
                    <td className='p-3'>
                      {(item.approvalstatus == 0 && item.rejectionmessage == null && item.collection != 'false') && 'awaiting approvall'}
                      {(item.approvalstatus == 0 && item.rejectionmessage != null) && 'Rejected'}
                      {(item.approvalstatus == 1) && 'Approved'}
                    </td>
                    <td className='p-3'>{item.rejectionmessage}</td>
                    <td className='p-3'>{item.disputed}</td>
                    <td className='p-3'>{item.disputedon != null ? new Date(item.disputedon).toLocaleDateString() : ''}</td>
                    <td className='p-3'>{item.disputereason}</td>
                    <td className='p-3'>{item.actionplan}</td>
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
