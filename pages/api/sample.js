import connection from "./db";
import database_queries from "./testResult";


class SampleHandler {
 constructor(status, date, request, response) {
  this.status = status;
  this.date = date;
  this.response = response;
  this.request = request;
 }

 getAllPending() {
  let SQL_QUERY = `SELECT p.BILLINGID,p.TEST,p.DATE,p.PATIENTID, p.SAMPLE_STATUS FROM performing_test  AS p LEFT OUTER JOIN new_patients AS  n ON p.PATIENTID = n.PATIENTID WHERE p.SAMPLE_STATUS = 'PENDING' AND p.DATE = CURDATE() ORDER BY p.BILLINGID DESC  LIMIT 100`;
  connection.query(SQL_QUERY, (err, result) => {
   if (err) {
    throw err;
   }
   this.response.send(result);
  }
  );
 }
 getStatus(status) {
  if (status != '') {
   let SQL_QUERY = `SELECT p.BILLINGID,p.TEST,p.DATE,p.PATIENTID, p.SAMPLE_STATUS FROM performing_test  AS p LEFT OUTER JOIN new_patients AS  n ON p.PATIENTID = n.PATIENTID WHERE p.SAMPLE_STATUS = '${status}'  LIMIT 100`;
   connection.query(SQL_QUERY, (err, result) => {
    if (err) {
     throw err;
    }
    this.response.send(result);
   }
   );
  }
 }
 getDates(date) {
  let SQL_QUERY = `SELECT p.BILLINGID,p.TEST,p.DATE,p.PATIENTID, p.SAMPLE_STATUS FROM performing_test  AS p LEFT OUTER JOIN new_patients AS  n ON p.PATIENTID = n.PATIENTID WHERE p.DATE = '${date}'  ORDER BY p.BILLINGID DESC  LIMIT 100`;
  connection.query(SQL_QUERY, (err, result) => {
   if (err) {
    throw err;
   }
   this.response.send(result);
  }
  );
 }
 getSelectedStutusAndDate(date, status) {
  let SQL_QUERY = `SELECT p.BILLINGID,p.TEST,p.DATE,p.PATIENTID, p.SAMPLE_STATUS FROM performing_test  AS p LEFT OUTER JOIN new_patients AS  n ON p.PATIENTID = n.PATIENTID WHERE p.DATE = '${date}' AND p.SAMPLE_STATUS = '${status}' ORDER BY p.BILLINGID DESC  LIMIT 100`;
  connection.query(SQL_QUERY, (err, result) => {
   if (err) {
    throw err;
   }
   this.response.send(result);
  }
  );
 }
 updateRecords() {

 }
}



function Sample(request, response) {
 let sampleHandle = new SampleHandler(request.query.status, new Date(), request, response);
 const { status, date } = request.query;
 switch (request.method) {
  case "GET":
   if (!status && !date) {
    sampleHandle.getAllPending();
   }
   else {
    if (status && !date) {
     sampleHandle.getStatus(status);
    }
    else if (!status && date) {
     sampleHandle.getDate(date);
    }
    else {
     sampleHandle.getSelectedStutusAndDate(status, date);
    }
   }
   break;
  case "POST":
   
 }

}



export default Sample;