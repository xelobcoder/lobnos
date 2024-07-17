import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CompanyHeaders from '../../../../components/ResultView/CompanyHeaders'
import { currencyFormatter, customFetch, getCompanyInformation } from '../../../../components/Auth/customFetch';
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
          <CompanyHeaders billingid={billingid} />
        </div>

        <div className='personal-information' style={{ fontSize: '16px' }}>
          <div className='d-flex  justify-content-between'>
            <div className='header'>Fullname: </div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation?.fullname} </div>
          </div>
          <div className='d-flex  justify-content-between'>
            <div className='header'>Billing ID </div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation?.billingid} </div>
          </div>
          <div className='d-flex  justify-content-between'>
            <div className='header'>Age: </div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation?.age} {invoice.clientInformation?.agetype} </div>
          </div>
          {/* <div className='d-flex  justify-content-between'>
            <div className='header'>Gender: </div>
            <div className='info mx-2 text-capitalize'> {invoice.clientInformation?.gender} </div>
          </div> */}

          <div className='d-flex  justify-content-between'>
            <div className='header'>Billing Date: </div>
            <div className='info mx-2 text-capitalize'>{new Date(invoice.clientInformation?.date).toLocaleDateString()} </div>
          </div>
          <div className='d-flex  justify-content-between'>
            <div className='header'>Contact: </div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation?.mobile_number} </div>
          </div>
          <div className='d-flex  justify-content-between border-bottom border-dark '>
            <div className='header'>Issued By: </div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation?.mobile_number} </div>
          </div>
        </div>
        <h4 className='text-capitalize text-center mt-1'>Payment receipt</h4>
        <div >
          <table style={{ border: '1px solid black', width: '100%' }}>
            <thead className='table-primary text-capitalize receipt-border'>
              <tr className='receipt-border'>
                <th className='receipt-border'>#</th>
                <th className='receipt-border'>test</th>
                <th className='receipt-border'> Price</th>
              </tr>
            </thead>
            <tbody className='receipt-border'>
              {invoice.testInformation.length > 0 && invoice.testInformation.map((item, index) => {
                return (
                  <tr key={index} >
                    <td className='receipt-border text-capitalize'>{index + 1}</td>
                    <td className='receipt-border text-capitalize'>{item.name}</td>
                    <td className='receipt-border text-capitalize'>{currencyFormatter.format(item.price)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className='mx-2'> {" >> "}Total </td>
                <td></td>
                <td>{currencyFormatter.format(invoice.clientInformation?.payable)}</td>
              </tr>
              <tr>
                <td className='mx-2'> {" >> "}Discount </td>
                <td></td>
                <td>{currencyFormatter.format(invoice.clientInformation?.discount)}</td>
              </tr>
              <tr>
                <td className='mx-2'> {" >> "}Amount Paid</td>
                <td></td>
                <td>{currencyFormatter.format(invoice.clientInformation?.paid_amount)}</td>
              </tr>
              <tr>
                <td className='mx-2'> {" >> "}Outstanding </td>
                <td></td>
                <td>{currencyFormatter.format(invoice.clientInformation?.outstanding)}</td>
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

