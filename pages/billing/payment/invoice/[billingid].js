import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CompanyHeaders from '../../../../components/ResultView/CompanyHeaders'
import { customFetch, getCompanyInformation } from '../../../../components/Auth/customFetch'
import { ArrowBackIos, Edit, Print } from '@mui/icons-material';
import VersionFooter from '../../../../components/accessories/VersionFooter';


async function getInvoiceData(id, wrapper) {
  const getInvoice = await customFetch(`billing/invoice?billingid=${id}`)
  const { result, message, statusCode } = getInvoice;
  if (statusCode == 200 && message == 'success') {
    const { testInformation, clientInformation } = result;
    wrapper({ testInformation, clientInformation });
  }
}

export default function GenerateBillingInvoice() {
  const [centerInfo, setCenterInfo] = useState({});
  const [invoice, setInvoice] = useState({ testInformation: [], clientInformation: {} })
  const router = useRouter();
  const billingid = router.query.billingid;

  useEffect(() => {
    getInvoiceData(billingid, setInvoice);
    getCompanyInformation(setCenterInfo)
  }, [billingid])

  return (
    <>
      <nav className='text-white p-2 m-0 d-flex' id='print-receipt-bar'>
        <div className='lims-color' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '10px' }}>
          ZOOM
        </div>
        <div className='d-flex justify-content-between' style={{ width: "19%", marginRight: '4px' }}>
          <button className='btn btn-outline-light btn-sm text-capitalize' onClick={() => window.print()} style={{ marginRight: '4px' }}><Print /> print</button>
          <button className='btn btn-outline-light btn-sm text-capitalize' style={{ marginRight: '4px' }}
            onClick={(e) => router.back()}><ArrowBackIos />back</button>
          <button className='btn btn-outline-light btn-sm text-capitalize' style={{ marginRight: '4px' }} onClick={(e) => {
            router.push(`/billing/updatebilling?billingid=${router.query.billingid}`)
          }}><Edit />update test</button>
        </div>
      </nav>
      <div id='invoice-receipt-view'>
        <div className='company-header container'>
          <CompanyHeaders details={centerInfo} />
        </div>
        <hr></hr>
        <div className='personal-information container'>
          <div className='_item'>
            <div className='header'>Billing id: </div>
            <div className='info'>{invoice.clientInformation?.BILLINGID} </div>
          </div>
          <div className='_item'>
            <div className='header'>Fullname: </div>
            <div className='info'>{invoice.clientInformation?.FULLNAME} </div>
          </div>
          <div className='_item'>
            <div className='header'>Age: </div>
            <div className='info'>{invoice.clientInformation?.AGE} {invoice.clientInformation?.AGETYPE} </div>
          </div>
          <div className='_item'>
            <div className='header'>Gender: </div>
            <div className='info'> {invoice.clientInformation?.GENDER} </div>
          </div>
          <div className='_item'>
            <div className='header'>Email: </div>
            <div className='info'>{invoice.clientInformation?.EMAIL} </div>
          </div>
          <div className='_item'>
            <div className='header'>Billing Date: </div>
            <div className='info'>{invoice.clientInformation?.DATE} </div>
          </div>
          <div className='_item'>
            <div className='header'>Contact: </div>
            <div className='info'>{invoice.clientInformation?.MOBILE_NUMBER} </div>
          </div>
        </div>
        <div className='billing-test-section container'>
          <table className='table'>
            <thead className='table-primary text-capitalize'>
              <tr>
                <th>#</th>
                <th>test</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {invoice.testInformation.length > 0 && invoice.testInformation.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.NAME}</td>
                    <td>{item.PRICE}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td> {">> "}Total </td>
                <td></td>
                <td>{invoice.clientInformation?.PAYABLE}</td>
              </tr>
              <tr>
                <td> {">> "}Discount </td>
                <td></td>
                <td>{invoice.clientInformation?.DISCOUNT}</td>
              </tr>
              <tr>
                <td> {">> "}Amount Paid</td>
                <td></td>
                <td>{invoice.clientInformation?.PAID_AMOUNT}</td>
              </tr>
              <tr>
                <td> {">> "}Outstanding </td>
                <td></td>
                <td>{invoice.clientInformation?.OUTSTANDING}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className='receipt-footer container'>
          <h6 className='d-flex justify-content-center text-primary'>
            Thank you for patronizing our service
          </h6>
          <VersionFooter />
        </div>
        <div className='container' id='inVoiceTitle'>
          <h1 className='bg-light br-5 text-center text-dark p-2'>Invoice</h1>
        </div>
      </div>
    </>
  )
}


GenerateBillingInvoice.getLayout = function (page) {
  return (
    <>
      {page}
    </>
  )
}
