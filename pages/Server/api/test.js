import { NextRequest, NextResponse } from "next/server";
import database_queries from "./database/queries";
import testResults from "./testResult";



function TestHandler(request, response) {
  const query = request.query;

  const containsValids = function (object, array) {
    let keys = Object.keys(object);

    if (keys.includes('billingid') && keys.includes('patientid') && keys.includes('test')) {
      return true;
    }
    else {
      return false;
    }
  }

  if (containsValids(request.body)) {
    const method = request.method;
    switch (request.body.test) {
      case 'bloodgroup':
        switch (method) {
          case 'POST':
            testResults.bloodgroup.post(request.body, response);
            break;
          case 'GET':
            testResults.bloodgroup.get(request.body, response);
            break;
          default:
            response.send({
              message: 'invalid method',
              statusCode: 400
            });
        }
        break;
    
    }
  }
  else {
    response.send({
      message: 'include patientid, billingid and test',
      statusCode: 201
    });
  }
}




export default TestHandler;