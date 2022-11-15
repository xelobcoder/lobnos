import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Invoice from '../../components/invoices/bilinvoice';
import Header from '../../components/header';

function INVOICE({ test }) {
 const clientid = parseInt(useRouter().query.patientid);
 const [invoice, setInvoice] = useState([]);

 useEffect(() => {
  if (typeof clientid == 'number') {
   new Invoice('invoice', clientid).getInvoiceData()
    .then((t) => { setInvoice(t) })
    .catch((err) => { console.log(err) })
  }
 }, [clientid])


 // find test price 

 const HandlePrice = function ({ item, data }) {
  let price = data.filter((single, index) => {
   return item.toLowerCase() == single.NAME.toLowerCase()
  })
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
      <td>1</td>
      <HandlePrice item={item} data={test} />
     </tr>
    )
   }
  )
 }

 return (
  <>
   <div id='invoice'>

    <div className='mt-3'  >
     <div className='row' id='invoice-strip'>
      <h1 style={{ fontSize: 60, marginTop: '-10px' }}>INVOICE</h1>
     </div>
    </div>

    {
     invoice.length == 0 ? null : (
      <div>
       <div className='invoice_to'>
        <h4>invoice to</h4>
        <h4>{invoice[0]["FULLNAME"]}</h4>
        <h4>patientID: {invoice[0]['PATIENTID']}</h4>
       </div>
      </div>
     )
    }

    <table id='invoice-table' className='table table-striped text-uppercase'>
     <thead className='thead table-dark text-white '>
      <tr className='p-5'>
       <th>#</th>
       <th>item description</th>
       <th>Qty</th>
       <th>price</th>
      </tr>
     </thead>
     <tbody>
      {
       invoice.length != 0 ? (
        <HandleTest param={invoice[0]['TEST']} test={test} />
       ) : null
      }
     </tbody>
     <tfoot>
      <tr>
       <td colSpan='3' className='text-secondary'>Total cost</td>
       {
        invoice.length == 0 ? null : (
         <td>GHC {invoice[0]['PAYABLE']}</td>
        )
       }
      </tr>
     </tfoot>
    </table>

    <div className='invoice-terms'>
     <h2>Thank you for your business</h2>
     <h4>Terms & Condition</h4>
     <p>
      All payments made are not refundable
     </p>

    </div>

    <div className='invoice-payment'>
     <h1>Payment Information</h1>
     <h4>Mobile Money : 0595964565</h4>
     <h4>Momo Name: Leonides</h4>
    </div>

   </div>
   {/* send via email or print out buttons */}

   <div className='d-flex justify-content-center'>
    <div >
     <button className='btn btn-block btn-primary'>
      send via email
     </button>
    </div>
    <div style={{marginLeft: 20}}>
     <button className='btn btn-danger ml-5'>
      print out
     </button>
    </div>
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