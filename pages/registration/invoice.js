import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Invoice from '../../components/invoices/bilinvoice';
import Header from '../../components/header';

function INVOICE({ test }) {
 const clientid = parseInt(useRouter().query.patientid);
 const [invoice, setInvoice] = useState([]);

 useEffect(() => {
  if (typeof clientid == 'number') {
   console.log(clientid)
   new Invoice('invoice', clientid, false).getInvoiceData()
    .then((t) => {
     setInvoice(t);
     console.log(t)
    })
    .catch((err) => { console.log(err) })
  }
 }, [clientid])


 // find test price 

 const HandlePrice = function ({ item, data }) {
  let price = data.filter((single, index) => {
   return item.toLowerCase() == single.NAME.toLowerCase()
  })
  console.log(invoice)
  return (
   <td>
    {price[0]['PRICE']}
   </td>
  )
 }


 // convert test string to a list for display
 const HandleTest = function ({ param }) {
  let testlist = new String(param).split(',');
  return testlist.map(
   (item, index) => {
    return (
     <tr key={index} style={{ padding: '20px !important' }}>
      <td>{index + 1}</td>
      <td>{item}</td>
      <HandlePrice item={item} data={test} />
     </tr>
    )
   }
  )
 }



 return (
  <>
   <div className='invoice-header'>
    {invoice.length == 0 ? null : (
     <>
      <div>
       <h2 className='text-capitalize'>{invoice[0]['companyname']}</h2>
       <p className='text-primary'>{invoice[0]['companyemail']}</p>
       <p className='text-primary'>{invoice[0]['companyAddress']}</p>
       <p className='text-primary'>0{invoice[0]['companyphone_number']}</p>
      </div>
     </>
    )}
    <h1>INVOICE</h1>
   </div>
   <div className='invoice'>
    {
     invoice.length == 0 ? <h1>no information found</h1> : (
      <>
       <section>
        <h4>invoice to</h4>
        <div>
         <h4>Name : {invoice[0]["FULLNAME"]}</h4>
         <h4>patientID: {invoice[0]['PATIENTID']}</h4>
         <h4>organization: {invoice[0]['PATIENTORGANIZATION']} </h4>
         <h4>Email: {invoice[0]['EMAIL']} </h4>
        </div>
       </section>
       <section>
        <table id='invoice-table' className='table table-striped text-uppercase'>
         <thead className='thead table-dark text-white '>
          <tr className='p-5'>
           <th>#</th>
           <th>test</th>
           <th>price</th>
          </tr>
         </thead>
         <tbody>
          <HandleTest param={invoice[0]['TEST']} test={test} />
         </tbody>
         <tfoot>
          <tr>
           <td colSpan='2' className='text-secondary'>Total cost</td>
           <td>GHC {invoice[0]['PAYABLE']}</td>
          </tr>
         </tfoot>
        </table>
       </section>
       <section>
        <div className='invoice-terms'>
         <h2>Thank you for your business</h2>
         <h4>Terms & Condition</h4>
         <p>
          All payments made are not refundable
         </p>

        </div>

        <div className='invoice-payment'>
         <h1>Payment information: </h1>
         <h4> Mobile Money : 0595964565</h4>
         <h4>Momo Name: Leonides</h4>
        </div>
       </section>
       <section className='mt-5'>
        <div className='d-flex justify-content-center' id='print-button'>
         <div >
          <button className='btn btn-block btn-primary'>
           send via email
          </button>
         </div>
         <div style={{ marginLeft: 20 }}>
          <button className='btn btn-danger ml-5' onClick={(e) => { window.print() }}>
           print out
          </button>
         </div>
        </div>
       </section>
      </>
     )
    }
   </div>
   <div className='container ml-5'>
    <p>Software by leonides. copyright reserved @2022, call us on 0249434803/0595964565</p>
   </div>
  </>
 )
}


export default INVOICE;


INVOICE.getLayout = function (page) {
 return (
  <>
   <Header />
   {page}
  </>
 )
}


export async function getServerSideProps(ctx) {
 // get all test panels
 let endpoint = `http://localhost:3000/api/testpanel/list`
 let response = await fetch(endpoint)
 let data = await response.json()
 return {
  props: {
   test: data
  }
 }
}