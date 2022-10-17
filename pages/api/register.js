import { resolve } from 'styled-jsx/css'
import connection from './db.js'
const SUCCESSMESSAGE = 'SUCCESS'
const ERRORMESSAGE = 'FAILED'
const ADD_PATIENT_QUERY = `INSERT INTO NEW_PATIENTS (
    FULLNAME,
    EMAIL,
    PATIENTTYPE,
    PATIENTID,
    AGE,
    AGETYPE,
    MARITAL_STATUS,
    RELATIONSHIP,
    EMMERGENCY_CONTACT_NAME,
    EMMERGENCY_CONTACT,
    GENDER,
    CLINICIAN,
    ORGANIZATION,
    DOB,
    MOBILE_NUMBER,
    OCCUPATION,
    PATIENTORGANIZATION
) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`

// Step: 1 - check if patient is already registered as a patient
// Step: 2 - if not registered, add patient to database
//  progress
// 1. return message to go to billing page
// 2. client is automatically activated to start billing
// 3. client is added to operational list
// 4. test is listed in performing test table with id linked to operational list
// Step: 3 - if registered, return error message of patient already registered
// Step: 4 - if patient is added, return success message
// step: 5

// step 1

// this function checks for the present of the patient in the database
/**
 *
 * @param {object} request http request boy for patientid
 * @returns {promise} promise returns a promise of true,false or error
 */
var checkpatient = function (request) {
  const { patientid } = request.body
  const CHECK_PATIENT_QUERY = `SELECT * FROM NEW_PATIENTS WHERE PATIENTID = ?`

  return new Promise((resolve, reject) => {
    // query db for patientid
    connection.query(CHECK_PATIENT_QUERY, [patientid], (err, result) => {
      if (err) {
        reject(err)
      }
      if (result) {
        result.length > 0 ? resolve(true) : resolve(false)
      }
    })
  })
}

// step 2

var addpatient = function (request, response) {
  const {
    fullname,
    email,
    patienttype,
    patientid,
    age,
    ageType,
    maritalstatus,
    relationship,
    emmergencyName,
    emmergencyContactNumber,
    mobile,
    gender,
    organization,
    clinician,
    days,
    months,
    years,
    occupation,
    patientOrganization,
  } = request.body

  var dob = new Date(parseInt(years), parseInt(months - 1), parseInt(days))

  const data = [
    fullname,
    email,
    patienttype,
    patientid,
    age,
    ageType,
    maritalstatus,
    relationship,
    emmergencyName,
    emmergencyContactNumber,
    gender,
    clinician,
    organization,
    dob,
    mobile,
    occupation,
    patientOrganization,
  ]

  checkpatient(request)
    .then((result) => {
      if (result == true) {
        response.send({
          status: ERRORMESSAGE,
          message: 'Patient already registered',
          patientid
        })
      }

      if (!result) {
        connection.query(ADD_PATIENT_QUERY, data, (err, result) => {
          if (err) throw err
          response.send({
            status: SUCCESSMESSAGE,
            message: 'Patient successfully registered',
            patientid
          })
        })
      }
    })
    .catch((err) => {
      throw err
    })
}

const getpatient = function (request, response) {
  if (Object.keys(request.query).length > 0) {
    if (Object.keys(request.query).includes('patientid')) {
      connection.query(
        'SELECT * FROM NEW_PATIENTS WHERE PATIENTID = ?',
        [request.query.patientid],
        (err, result) => {
          if (err) throw err
          response.send(result)
        },
      )
    }

    if (
      Object.keys(request.query).includes('filter') &&
      !Object.keys(request.query).includes('date_from')
    ) {
      const { filter } = request.query
      //  Filter fullname or patient id
      connection.query(
        'SELECT * FROM NEW_PATIENTS WHERE FULLNAME LIKE ? OR PATIENTID LIKE ?',
        ['%' + filter + '%', '%' + filter + '%'],
        (err, result) => {
          if (err) {
            throw err
          }
          response.send(result)
        },
      )
    }
    // if contains filter value , date from and date to

    if (
      Object.keys(request.query).includes('filter') &&
      Object.keys(request.query).includes('date_from')
    ) {
      const { filter } = request.query
      const { date_from } = request.query || new Date()
      const { date_to } = request.query || new Date()
      connection.query(
        'SELECT * FROM NEW_PATIENTS WHERE FULLNAME LIKE ? OR PATIENTID LIKE ? AND DATE BETWEEN ? AND ?',
        ['%' + filter + '%', '%' + filter + '%', date_from, date_to],
        (err, result) => {
          if (err) {
            throw err
          }
          response.send(result)
        }
      )
    }
  } else {
    // send all first 500 patients
    connection.query('SELECT * FROM NEW_PATIENTS LIMIT 1000', (err, result) => {
      if (err) {
        throw err
      }
      response.send(result)
    })
  }
}

export default function handler(request, response) {
  switch (request.method) {
    case 'POST':
      addpatient(request, response)
      break
    case 'GET':
      getpatient(request, response)
      break
    default:
      response.send('Not quite sure what you are trying to do?')
  }
}
