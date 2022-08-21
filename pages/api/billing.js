import connection from './db.js';




// add test to performing test
const addperformingTest = (patientid, billingid, test, urgency, res,samplingCenter) => {
 // check if test is an array or a string , if string,check to see if is not empty
 const isValid = Array.isArray(test) || (typeof test == 'string' && test != '') ? true : false;
 // if test is an array
 if (isValid) {
  // sanitize test array
  const sanitize = function (test) {
   // if an array
   if (Array.isArray(test)) {
    // convert to string
    return test.join(',');
   }
   // if a string
   return test;
  }
  // if patient id and billing id are not empty
  if (patientid != '' && billingid != '') {
   // push data into performing test table
   let values = [patientid, billingid, sanitize(test), urgency,samplingCenter];
   let sql = `INSERT INTO performing_test (PATIENTID,BILLINGID,TEST,URGENCY,SAMPLING_CENTER) VALUES (?,?,?,?,?)`;
   connection.query(sql, values, (err, result) => {
    if (err) throw err;
    res.status(200).json({ message: 'success' });
   })
  }
 }

}

// add new billing
const addBilling = (req, res) => {
 const { patientid, clinicians, organizations, test, cost, paid, urgency, discount, paymentmode,samplingCenter} = JSON.parse(req.body);
 console.log(req.body);
 // get outstanding balance
 let outstanding = parseInt(cost) - parseInt(discount) - parseInt(paid);
 // get type
 let type = paymentmode == 'invoice' ? 'POSTPAID' : 'PREPAID';
 // billing data
 let values = [parseInt(patientid), clinicians, organizations, paid, cost, paymentmode, type, outstanding];
 console.log(values);

 // insert billing data into billing table
 let sql = `INSERT INTO billing (PATIENTID,CLINICIAN,ORGANIZATION,PAID_AMOUNT,PAYABLE,PAYMENT_MODE,TYPE,OUTSTANDING) VALUES (?,?,?,?,?,?,?,?)`;

 connection.query(sql, values, (err, result) => {
  if (err) throw err;
  if (result) {
   let billingid = result.insertId;
   // add test to performing test
   addperformingTest(patientid, billingid, test, urgency, res,samplingCenter);
  }
 })

}

export default function handler(request, response) {
 const method = request.method;
 // switch method
 switch (method) {
  case 'POST':
   addBilling(request, response);
   break;
  default:
   response.status(405).json({ message: 'method not allowed' });
 }
}