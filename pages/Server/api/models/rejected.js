const connection = require('../db')

// use case scenario

// query data via billingid to get information about the rejected client sample and personal information


const getSampleManagerValidation = async function (request, response, billingid) {
  const query = 'SELECT * FROM  manager_sample_descision where BILLINGID = ?';

  connection.query(query, billingid, function (err, result) {
    if (err) {
      response.send({
        status: 'error',
        err
      })
    }

    if (result) {
      response.send({
        status: 'success',
        statusCode: 200,
        result
      })
    }
  })
}


const updateSamplerRecord = async function (request, response) { }



const rejectedSample = async function (request, response) {
  const type = request.query.type;

  if (!type) {
    response.status(404).send({
      message: 'type required',
      statusCode: 404
    })
  }
  else {
    if (type === 'getsampleinfo') {
      const billingid = request.query.billingid;
      if (billingid) {
        let query = `SELECT  * from performing_test as rejected INNER JOIN (SELECT * FROM new_patients) as p ON rejected.PATIENTID = p.PATIENTID WHERE rejected.BILLINGID =' ${billingid}' AND rejected.SAMPLE_STATUS = 'REJECTED';`
        // execute query
        connection.query(query, (err, result) => {
          if (err) {
            console.log(err)
            response.status(400).send({
              statusCode: 301,
              message: 'error occured'
            })
          }
          // send the response 
          else {
            response.status(200).send({
              statusCode: 200,
              message: 'success',
              result
            })
          }
        })
      }
      else {
        response.status(400).send({
          statusCode: 301,
          message: 'billingid is required'
        })
      }
    }
    else if (type === 'getvalidationstatus') {
      const billingid = request.query.billingid;
      if (billingid) {
        getSampleManagerValidation(request, response, billingid)
      } else {
        response.status(404).send({
          message: 'include',
          statusCode: 404
        })
      }
    }
    else {
      response.status(404).send({
        message: 'type not recognized',
        statusCode: 404
      })
    }
  }
}




const RejectedSampleApproval = async function (request, response) {
  const { action, billingid, manager, message } = request.body;

  const query = `INSERT INTO manager_sample_descision (BILLINGID,ACTION,MESSAGE,MANAGER) VALUES (?,?,?,?)`
  connection.query(query, [billingid, action, message, manager], function (err, result) {
    if (err) {
      response.send({
        status: 'error',
        err
      })
    }
    if (result) {
      response.send({
        status: 'success',
        message: 'updated',
        statusCode: 200
      })
    }
  })
}



module.exports = {
  rejectedSample,
  RejectedSampleApproval
}