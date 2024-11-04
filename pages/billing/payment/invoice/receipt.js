import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CompanyHeaders from '../../../../components/ResultView/CompanyHeaders';
import { currencyFormatter, customFetch, getCompanyInformation } from '../../../../components/Auth/customFetch';
import VersionFooter from '../../../../components/accessories/VersionFooter';

async function getInvoiceData(employeeid, wrapper) {
  if (employeeid) {
    const result = await customFetch(`billing/invoice?billingid=${employeeid}`);
    const { testInformation, clientInformation } = result;
    wrapper({ testInformation, clientInformation });
  }
}

export default function GenerateBillingInvoice() {
  const [centerInfo, setCenterInfo] = useState({});
  const [invoice, setInvoice] = useState({ testInformation: [], clientInformation: {} });
  const [paperSize, setPaperSize] = useState('A4'); // Track paper size
  const billingid = useSearchParams().get("billingid");

  useEffect(() => {
    getInvoiceData(billingid, setInvoice);
    getCompanyInformation(setCenterInfo);
  }, [billingid]);

  const handlePaperSizeSelection = (size) => setPaperSize(size); // Update paper size

  return (
    <div className={`billing-invoice ${paperSize}`}>
      <div id='receipt-buttons' className='mb-3'>
        <button type='button' onClick={() => window.print()} className='btn btn-secondary btn-sm'>Print Receipt</button>
        <button className='btn btn-secondary btn-sm mx-2'>Email Receipt</button>

        <select onChange={(e) => handlePaperSizeSelection(e.target.value)} className='form-select form-select-sm d-inline-block w-auto ms-2'>
          <option value="A4">A4</option>
          <option value="A5">A5</option>
          <option value="Letter">Letter</option>
        </select>
      </div>

      <div id='invoice-receipt-view' className='invoice-container'>
        <div className='company-header border-bottom border-2 border-dark'>
          <CompanyHeaders billingid={billingid} />
        </div>

        <div className='personal-information' style={{ fontSize: '16px' }}>
          <div className='d-flex justify-content-between'>
            <div className='header'>Fullname:</div>
            <div className='info mx-2 text-capitalize'>
              {invoice.clientInformation.firstname} {invoice.clientInformation.lastname}
            </div>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='header'>Billing ID:</div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation.billingid}</div>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='header'>Age:</div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation.age} {invoice.clientInformation.agetype}</div>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='header'>Billing Date:</div>
            <div className='info mx-2 text-capitalize'>
              {new Date(invoice.clientInformation.date).toLocaleDateString()}
            </div>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='header'>Contact:</div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation.mobile_number}</div>
          </div>
          <div className='d-flex justify-content-between border-bottom border-dark'>
            <div className='header'>Issued By:</div>
            <div className='info mx-2 text-capitalize'>{invoice.clientInformation.mobile_number}</div>
          </div>
        </div>

        <h4 className='text-capitalize text-center mt-1'>Payment Receipt</h4>
        <div>
          <table style={{ border: '1px solid black', width: '100%' }}>
            <thead className='table-primary text-capitalize receipt-border'>
              <tr className='receipt-border'>
                <th className='receipt-border'>#</th>
                <th className='receipt-border'>Test</th>
                <th className='receipt-border'>Price</th>
                <th className='receipt-border'>Discount</th>
              </tr>
            </thead>
            <tbody className='receipt-border'>
              {invoice.testInformation.map((item, index) => (
                <tr key={item.serviceid}>
                  <td className='receipt-border text-capitalize'>{index + 1}</td>
                  <td className='receipt-border text-capitalize'>{item.servicecategory}</td>
                  <td className='receipt-border text-capitalize'>{currencyFormatter.format(item.cost)}</td>
                  <td className='receipt-border text-capitalize'>{currencyFormatter.format(item.discount || 0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className='mx-2'>{" >> "}Total</td>
                <td></td>
                <td>{currencyFormatter.format(invoice.clientInformation.payable)}</td>
                <td></td>
              </tr>
              <tr>
                <td className='mx-2'>{" >> "}Discount</td>
                <td></td>
                <td>{currencyFormatter.format(invoice.clientInformation.discount)}</td>
                <td></td>
              </tr>
              <tr>
                <td className='mx-2'>{" >> "}Amount Paid</td>
                <td></td>
                <td>{currencyFormatter.format(invoice.clientInformation.paid)}</td>
                <td></td>
              </tr>
              <tr>
                <td className='mx-2'>{" >> "}Outstanding</td>
                <td></td>
                <td>{currencyFormatter.format(invoice.clientInformation.outstanding)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className='receipt-footer text-center mt-4'>
          <h6 className='text-primary'>Thank you for patronizing our service</h6>
          <VersionFooter />
        </div>
      </div>

      <style jsx global>{`
        /* Default styles for all sizes */
        .billing-invoice {
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        /* A4 paper size */
        .billing-invoice.A4 {
          width: 210mm;
        }

        /* A5 paper size */
        .billing-invoice.A5 {
          width: 148mm;
        }

        /* Letter paper size */
        .billing-invoice.Letter {
          width: 216mm;
        }

        /* Print-specific styling */
        @media print {
          body * {
            visibility: hidden;
          }

          .billing-invoice, .billing-invoice * {
            visibility: visible;
          }

          .billing-invoice {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
