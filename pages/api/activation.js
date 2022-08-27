import connection from './db'

const activation = {
  ACTIVATION_PAGE_QUERY: `SELECT ID,PATIENTID,FULLNAME,DATE,ACTIVATION_STATUS FROM 
    NEW_PATIENTS ORDER BY DATE DESC LIMIT 100`,
  // get partial data of patients
  getPartialData: function (request, response) {
    connection.query(this.ACTIVATION_PAGE_QUERY, (err, result) => {
      if (err) {
        throw err
      }
      response.send(result)
    })
  },
  activateDeactivate: function (request, response) {
    const { patientid, action } = request.query
    if (patientid && action) {
      connection.query(
        `UPDATE NEW_PATIENTS SET ACTIVATION_STATUS = ? WHERE PATIENTID = ?`,
        [action, patientid],
        (err, result) => {
          if (err) {
            throw err
          }
          response.send({
            message: 'success',
            action: action === 'TRUE' ? 'BILLING' : 'ACTIVATION PAGE'
          })
        },
      )
    }
  },
}

function handler(request, response) {
  switch (request.method) {
    case 'GET':
      if (
        Object.keys(request.query).includes('action') &&
        Object.keys(request.query).includes('patientid')
      ) {
        activation.activateDeactivate(request, response)
      } else {
        activation.getPartialData(request, response)
      }
      break
    default:
      response.send('Method case still in progress')
  }
}

export default handler
