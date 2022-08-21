import connection from './db.js';




// add test to performing test
const addperformingTest = async (patientid, billingid, test, urgency) => {
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
   let values = [patientid, billingid, sanitize(test), urgency];
   let sql = `INSERT INTO performingtest (PATIENTID,BILLINGID,TEST,URGENCY) VALUES ?`;
   connection.query(sql, [values], (err, result) => {
    if (err) throw err;
    response.status(200).json({ message: 'test added to performing test' });
   })
  }
 }

}

// add new billing
const addBilling = async (req, res) => {
 const { patientid, clinician, organiation, test, cost, paid, urgency, discount, paymentmode } = req.body;
 // get outstanding balance
 let outstanding = cost - discount - paid;
 // get type
 let type = paymentmode == 'invoice' ? 'POSTPAID' : 'PREPAID';
 // billing data
 let values = [patientid, clinician, organiation, paid, cost, paymentmode, type, outstanding];


 let sql = `INSERT INTO billing (PATIENTID,CLINICIAN,ORGANIZATION,PAID_AMOUNT,PAYABLE,PAYMENT_MODE,TYPE,OUTSTANDING) VALUES ?`;

 connection.query(sql, [values], (err, result) => {
  if (err) throw err;
  if (result) {

  }
 })

}

export default function handler(request, response) {
 console.log(request.body);
 response.status(200).json({
  message: 'hello world'
 })
}