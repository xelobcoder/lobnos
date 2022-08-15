// handle mobile number validation
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

export const handleSubmitRegistration = (e, data = {}, setError) => {
  e.preventDefault()
  // error marker , at end run if true , data is not sent to endpoint.
  let error = false
  // fields that must have values
  const requiredFields = [
    'fullname',
    'patientid',
    'patienttype',
    'age',
    'ageType',
    'maritalstatus',
    'emmergencyContactNumber',
    'samplingCenter',
    'relationship',
    'mobile',
    'gender',
  ]

  // however if refered, clinician and organization value must be filled
  // less, clinician  and organization must be empty
  const referedChecker = ['organization', 'clinician']

  // destruture received data
  const { patienttype } = data
  //  validate information to ensure validator information is captured
  function rd(data, patienttype) {
    // error marker , at end run if true , data is not sent to endpoint.
    let error = false
    if (patienttype == 'Refered') {
      if (data[referedChecker[0]] == '' || data[referedChecker[1]] == '') {
        error = true
      } else {
        return
      }
    } else {
      for (let i = 0; i < requiredFields.length; i++) {
        data[requiredFields[i]] == '' ? (error = false) : null
      }
    }

    return error
  }

  console.log(rd(data,patienttype));
}
