import connection from "./db";
import database_queries from "./testResult";
// YET TO BE CODED
// AFTER CHANGE OF STATUS CLIENT WOULD BE NOTIFIED VIA EMAIL
// OF SAMPLE STATUS CHANGE AND NECESSARY ACTION TO BE AND RECOMMEDATION TAKEN

class SampleHandler {
  constructor(status, date, request, response) {
    this.status = status;
    this.date = date;
    this.response = response;
    this.request = request;
  }

  getStatus(status) {
    if (status != "") {
      let SQL_QUERY = `
      SELECT DISTINCT p.SAMPLE_STATUS,
      p.PATIENTID,
      p.BILLINGID,
      np.FULLNAME,
      p.MESSAGE,
      p.DATE,
      p.TEST,
      p.ID
     FROM PERFORMING_TEST as p
      join billing as b ON p.PATIENTID = b.PATIENTID
      join new_patients as np ON p.PATIENTID = np.PATIENTID
     WHERE p.SAMPLE_STATUS = '${status}' ORDER BY p.DATE DESC LIMIT 100   
      `;
      connection.query(SQL_QUERY, (err, result) => {
        if (err) {
          throw err;
        }
        this.response.send(result);
      });
    }
  }
  getDates(date) {
    let SQL_QUERY = `
    SELECT DISTINCT p.SAMPLE_STATUS,
      p.PATIENTID,
      p.BILLINGID,
      np.FULLNAME,
      p.DATE,
      p.MESSAGE,
      p.TEST,
      p.ID
     FROM PERFORMING_TEST as p
      join billing as b ON p.PATIENTID = b.PATIENTID
      join new_patients as np ON p.PATIENTID = np.PATIENTID
     WHERE p.DATE= ${date} ORDER BY p.BILLINGID DESC LIMIT 100    
    `;
    connection.query(SQL_QUERY, (err, result) => {
      if (err) {
        throw err;
      }
      this.response.send(result);
    });
  }
  getSelectedStutusAndDate(date, status) {
    if (date && status) {
      let SQL_QUERY = `
    SELECT DISTINCT p.SAMPLE_STATUS,
      p.PATIENTID,
      p.BILLINGID,
      p.MESSAGE,
      np.FULLNAME,
      p.DATE,
      p.TEST,
      p.ID
     FROM PERFORMING_TEST as p
      join billing as b ON p.PATIENTID = b.PATIENTID
      join new_patients as np ON p.PATIENTID = np.PATIENTID
     WHERE p.DATE='${date}' AND p.SAMPLE_STATUS ='${status}' ORDER BY p.BILLINGID DESC LIMIT 100   
    `;
      connection.query(SQL_QUERY, (err, result) => {
        if (err) {
          throw err;
        }
        this.response.send(result);
      });
    }
  }
  getRecords() {
    let SQL_QUERY = `
   SELECT DISTINCT p.SAMPLE_STATUS,
      p.PATIENTID,
      p.BILLINGID,
      np.FULLNAME,
      p.DATE,
      p.TEST,
      p.MESSAGE,
      p.ID
     FROM PERFORMING_TEST as p
      join billing as b ON p.PATIENTID = b.PATIENTID
      join new_patients as np ON p.PATIENTID = np.PATIENTID
      ORDER BY p.BILLINGID DESC LIMIT 100
  `;
    connection.query(SQL_QUERY, (err, result) => {
      if (err) {
        throw err;
      }
      this.response.send(result);
    });
  }
  updateRecords(status, billingid, message = '') {
    // update performing test table first
    // update sample table to reflect change in status
    // return update records for changes to UI
    let query = function (status, billingid, message = '') {
      const query_accepted = `
    UPDATE PERFORMING_TEST 
    SET SAMPLE_STATUS = '${status}',
     INSPECTION_TIME = NOW(),
     INSPECTOR = 'Dr Tiifu Hamza'
     WHERE BILLINGID = '${billingid}'`;

      const query_rejected = `
    UPDATE PERFORMING_TEST
    SET SAMPLE_STATUS = '${status}',
      INSPECTION_TIME = NOW(),
      INSPECTOR = 'Dr Tiifu Hamza',
      MESSAGE = '${message}'
    WHERE BILLINGID = '${billingid}'`;

      return status == 'ACCEPTED' ? query_accepted : query_rejected;
    }

    connection.query(query(status, billingid, message), (err, result) => {
      if (err) throw err;
      this.response.send(result);
    });
  }
}

function Sample(request, response) {
  let sampleHandle = new SampleHandler(
    request.query.status,
    new Date(),
    request,
    response
  );
  const { status, date } = request.query;


  switch (request.method) {
    case "GET":
      if (!status && !date) {
        sampleHandle.getRecords();
      }
      else {
        if (status && !date) {
          sampleHandle.getStatus(status);
        } else if (!status && date) {
          sampleHandle.getDate(date);
        } else {
          sampleHandle.getSelectedStutusAndDate(date, status);
        }
      }



      break;
    case "PUT":
      const data = JSON.parse(request.body);
      console.log(data);
      const { status, billingid, message = '' } = data;
      sampleHandle.updateRecords(status.toUpperCase(), billingid, message);
  }
}

export default Sample;
