import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CompanyHeaders from '../../../../components/ResultView/CompanyHeaders'
import { customFetch, getCompanyInformation } from '../../../../components/Auth/customFetch';
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
  const billingid = useSearchParams().get("billingid");

  useEffect(() => {
    getInvoiceData(billingid, setInvoice);
    getCompanyInformation(setCenterInfo)
  }, [billingid])

  return (
    <>
      <div id='receipt-buttons'>
        <button type='button' onClick={(ev) => { window.print() }} className='btn btn-secondary btn-sm'>Print receipt</button>
        <button className='btn btn-secondary btn-sm mx-2'>Email receipt</button>
      </div>
      <div id='invoice-receipt-view' >
        <div className='company-header border-bottom  border-2 border-dark'>
          <CompanyHeaders details={centerInfo} />
        </div>

        <div className='personal-information  grid-50 '>
          <div className='_item d-flex'>
            <div className='header'>Billing id: </div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation?.billingid} </div>
          </div>
          <div className='_item d-flex'>
            <div className='header'>Fullname: </div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation?.fullname} </div>
          </div>
          <div className='_item d-flex'>
            <div className='header'>Age: </div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation?.age} {invoice.clientInformation?.agetype} </div>
          </div>
          <div className='_item d-flex'>
            <div className='header'>Gender: </div>
            <div className='info mx-2 text-capitalize'> {invoice.clientInformation?.gender} </div>
          </div>
          <div className='_item d-flex'>
            <div className='header'>Email: </div>
            <div className='info mx-2 '>{invoice.clientInformation?.email} </div>
          </div>
          <div className='_item d-flex'>
            <div className='header'>Billing Date: </div>
            <div className='info mx-2 text-capitalize'>{new Date(invoice.clientInformation?.date).toLocaleDateString()} </div>
          </div>
          <div className='_item d-flex'>
            <div className='header'>Contact: </div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation?.mobile_number} </div>
          </div>
        </div>
        <div className='billing-test-section'>
          <table className='billing-cart-table'>
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
                    <td>{item.name}</td>
                    <td>{item.price}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td> {">> "}Total </td>
                <td></td>
                <td>{invoice.clientInformation?.payable}</td>
              </tr>
              <tr>
                <td> {">> "}Discount </td>
                <td></td>
                <td>{invoice.clientInformation?.discount}</td>
              </tr>
              <tr>
                <td> {">> "}Amount Paid</td>
                <td></td>
                <td>{invoice.clientInformation?.paid_amount}</td>
              </tr>
              <tr>
                <td> {">> "}Outstanding </td>
                <td></td>
                <td>{invoice.clientInformation?.outstanding}</td>
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
      </div>
    </>
  )
}

