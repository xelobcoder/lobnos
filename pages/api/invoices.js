import connection from './db';
let actions = {
 INVOICE_DATA: function (idx, response) {
  // idx = billing id
  let SQL_QUERY = `SELECT DISTINCT * FROM billing AS t INNER JOIN (SELECT * FROM performing_test) AS p ON t.BILLINGID = p.BILLINGID  INNER JOIN (SELECT * FROM new_patients) AS n ON p.PATIENTID = n.PATIENTID WHERE t.BILLINGID ='${idx}'
  `;
  connection.query(SQL_QUERY, function (err, result) {
   if (err) {
    response.send({ status: 'error' })
    throw err
   }
   response.send({
    status: 'success',
    message: 'done',
    result
   })
  })
 }
}
export default function handler(request, response) {
 let method = request.method;
 switch (method) {
  case 'GET':
   const { action, id } = request.query;
   if (action == 'INVOICE_DATA') {
    actions.INVOICE_DATA(id, response);
   }
   break;
  default:
   return 'method not recognized'
 }
}