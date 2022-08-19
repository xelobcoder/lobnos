// handle mobile number validation
import { useRouter } from 'next/router'
export const handleMobile = (e, setValue, data, setError) => {
  let value = e.target.value
  let length = value.length
  setValue({ ...data, mobile: value })
  if (length > 10) {
    setError('Maximum of 10 numbers required')
  } else if (length < 10) {
    setError('Minimum of 10 numbers required')
  } else {
    setError('')
  }
  if (!value.startsWith(0)) {
    setError('Number must start with 0')
  }
}

export const handleEmail = (e, setValue, data, setError) => {
  let value = e.target.value
  setValue({ ...data, email: value })
  const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (value != '') {
    pattern.test(value) ? setError('') : setError('invalid Email')
  }
}

// handle age validation
// automatically calculate age from day, month, year inputs if
// all are filled
// interested in years , months, day determined by the user
// if years is  greater than 0, then calculate age from years
// if years is 0, then calculate age from months
// if years is 0 and months is 0, then calculate age from days

export const handleAge = (y, m, d) => {
  if (y != '' && m != '' && d != '') {
    let date = new Date(y, m, d)
    let today = new Date()
    let years = today.getFullYear() - y
    let months = today.getMonth() + 1 - m
    let daysdiff = today.getDate() - d
    console.log(daysdiff)

    if (years == 0 && months == 0 && daysdiff <= 0) {
      console.log('run logic one')
      return {
        years: 0,
        months: 0,
        days: 0,
      }
    }

    if (years == 0 && months == 0 && daysdiff > 0) {
      console.log('run logic two')
      return {
        years: 0,
        months: 0,
        days: daysdiff,
      }
    }

    if (years == 0 && months != 0) {
      console.log('run logic three')
      if (Math.sign(months) == -1) {
        return 'invalid Date'
      } else {
        if (daysdiff < 0) {
          console.log('run logic 4')
          return {
            months: months - 1,
            days: daysdiff + 30,
            years: 0,
          }
        } else {
          console.log('run logic 5')
          return {
            years: 0,
            months: months,
            days: daysdiff,
          }
        }
      }
    }

    if (years != 0) {
      if (Math.sign(years) == -1) {
        return 'invalid Date'
      } else {
        if (months == 0) {
          if (daysdiff == 0) {
            console.log('run logic 6')
            return {
              years: years,
              months: 0,
              days: 0,
            }
          } else {
            if (daysdiff > 0) {
              console.log('run logic 7')
              return {
                years,
                months: 0,
                days: daysdiff,
              }
            } else {
              console.log('run logic 8')
              return {
                years: years - 1,
                months,
                daysdiff,
              }
            }
          }
        } else {
          if (Math.sign(months) == -1) {
            console.log('run logic 9')
            return {
              years: years - 1,
              months: today.getMonth() + 1,
              days: null,
            }
          } else {
            console.log('run logic 10')
            return {
              years: years,
              months: months,
              days: null,
            }
          }
        }
      }
    }
  } else {
    return null
  }
}

export const BASEURL = 'http://localhost:5000/api/v1/patientid/'

export const handleSubmitRegistration = (e, data = {}, BASE) => {
  e.preventDefault()
  // error marker , at end run if true , data is not sent to endpoint.
  var error = false
  // fields that must have values
  const requiredFields = [
    'fullname',
    'patientid',
    'patienttype',
    'age',
    'ageType',
    'maritalstatus',
    'emmergencyContactNumber',
    'relationship',
    'mobile',
    'gender',
    'patientOrganization',
    'occupation',
  ]

  // however if refered, clinician and organization value must be filled
  // less, clinician  and organization must be empty
  const referedChecker = ['organization', 'clinician']

  // destruture received data
  const { patienttype } = data
  //  validate information to ensure data consistency
  /**
   *
   * @param {object} object data of patient  per inputs
   * @param {*} patienttype
   * @returns
   */
  function rd(data, patienttype) {
    // error marker , at end run if true , data is not sent to API endpoint for storage
    var error = { state: false, message: '' }
    // fields that must have values
    if (patienttype == 'Refered') {
      if (
        data[referedChecker[0]] == '' ||
        data[referedChecker[0]] == null ||
        data[referedChecker[1]] == null ||
        data[referedChecker[1]] == ''
      ) {
        error.state = true
      }
    }

    if (patienttype == 'Direct') {
      //  maintain error is false ,if all values are filled
      if (!Object.values(data).includes('')) {
        return
      }
      //  function runs for each of the required fields againts the data

      function markEmptyFields(data = {}, array = []) {
        return array.filter((option) => {
          return (
            data[option] == undefined ||
            data[option] == '' ||
            data[option] == null
          )
        })
      }
      // array length suggest if empty fields are preset or not.
      if (markEmptyFields(data, requiredFields).length > 0) {
        error.state = true
        error.message =
          markEmptyFields(data, requiredFields).join(', ') + ' are required'
      }
    }

    if (patienttype == '' || patienttype == null || patienttype == undefined) {
      error.state = true
      error.message = 'patient type is required'
    }
    return error
  }

  // truth, action = fire data saving
  // false , action = decline sending data to database

  if (rd(data, patienttype).state == true) {
    // destructure message of empty fields
    const { message } = rd(data, patienttype)
    return (error = message)
  }

  console.log(rd(data, patienttype).state)

  if (rd(data, patienttype).state == false) {
    //  send data to db async
    let push_data_async = async function () {
      let endpoint = await fetch(BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      let response = await endpoint.json()
      return response
    }
    //  run async function
    push_data_async().then((response) => {
      if (response.message == 'Patient successfully registered') {
        window.location.href = '/activation' + response.patientid
      } else {
        window.location.href =
          '/activation?message=' +
          response.message +
          '&patientid=' +
          response.patientid
      }
    })
  } else {
    return error
  }
  return error
}



export async function handleActivation(e,id,status,patientid) {
  let action = status == 'TRUE' ? 'FALSE' : 'TRUE'
  let endpoint_get = await fetch(`http://localhost:3000/api/activation/?patientid=${patientid}&action=${action}`)
  let response = await endpoint_get.json()
  if(response.action == 'BILLING') {
    window.location.href = '/registration/billing?patientid=' + patientid
  }
  else {
    window.location.href = '/activation?patientid=' + patientid
  }
}