import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import SettingsLayout from '../../../../components/settingsComponents/SettingsLayout'
import { customData } from '../../../../components/Auth/customFetch';
import { billingoptions } from '../../../../components/Auth/billing';
import { MonetizationOn, Money } from '@mui/icons-material';
import PreviewPatientInformation from '../../../../components/petientsComponent/PreviewPatientInformation';

export default function BillingUpdatelientpaymentHistory() {
  const [outHx, setoutstandinghX] = useState([]);
  const patientid = useRouter().query.patientid;

  // update transaction Hx
  useEffect(() => {
    if (patientid) {
      async function get() { await customData(`billing/client/bulk/outstanding?patientid=${parseInt(patientid)}`, setoutstandinghX) }; get();
    }
  }, [patientid])

  return (
    <>
      <SettingsLayout>
        <div className='container mt-5'>
          <div className='grid-70-30'>
            <PreviewPatientInformation patientid={patientid} />
            <div className='card br-5 mt-2'>
              <div className='card-header'><h4>Total Outstanding Bill</h4></div>
              <div className='text-danger mb-1 d-flex '>
                <span className='text-white'>
                  <MonetizationOn fontSize='large' color='success' sx={{ height: '100px', width: '100px'}} />
                </span>
                <h1 className='d-flex' style={{ alignItems: 'center' }}>
                  478389
                </h1>
              </div>
            </div>
          </div>
          <div className='form-row'>
            <label className='text-primary'>Amount</label>
            <input type='number' className='form-control' placeholder='enter payment amount' />
          </div>
          <div className='form-row'>
            <label className='text-primary'>Payment Modes</label>
            <select className='form-control'>
              {billingoptions.map((item, index) => { return (<option key={index}>{item}</option>) })}
            </select>
          </div>
          <h2 className='mt-2'>Transaction History</h2>
          <table className='table border br-5'>
            <thead style={{ backgroundColor: '#00224f', color: 'white' }} >
              <tr>
                <th>Date</th>
                <th>billing id</th>
                <th>Cost incurred</th>
                <th>Paid Amount</th>
                <th>Discount</th>
                <th>outstanding</th>
              </tr>
            </thead>
            <tbody>
              {outHx.length === 0 ? <tr><td scope='5'>No data Available</td></tr> : outHx.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item?.date.slice(0, 10)}</td>
                    <td>{item?.billingid}</td>
                    {/* <td>{item?.FIRSTNAME} {item?.MIDDLENAME} {item?.LASTNAME}</td> */}
                    <td>{item?.payable}</td>
                    <td>{item?.paid}</td>
                    <td>{item?.discount}</td>
                    <td className={`${item?.outstanding > 0 ? 'text-danger' : 'text-primary'}`}>{item?.outstanding}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SettingsLayout>
    </>
  )
}



