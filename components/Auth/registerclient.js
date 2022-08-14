import { data, math } from '@tensorflow/tfjs'
import * as yup from 'yup'
import { ref } from 'yup'

// handle mobile number validation
export const handleMobile = (e, setValue, data,setError) => {
  let value = e.target.value
  let length = value.length
  setValue({...data, mobile: value})
  if (length > 10) {
    setError('Maximum of 10 numbers required')
  } else if (length < 10) {
    setError('Minimum of 10 numbers required')
  }
  else {
    setError('')
  }
  if (!value.startsWith(0)) {
    setError('Number must start with 0')
  }
}


export const handleEmail = (e, setValue, data,setError) => {
  const positiveTest = function () {
    setValue({...data, email: value}) 
    setError('')
  }
  let value = e.target.value
  const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (value != '') {
    return pattern.test(value)? 
    positiveTest()
    : setError('Invalid email')
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
    let years = today.getFullYear() - date.getFullYear();
    let months = today.getMonth() - date.getMonth() + 1;
    console.log(years, today)
    let daysdiff = today.getDate() - date.getDate();


    if (years == 0 && months == 0 && daysdiff <= 0) {
      return 0
    }

    if (years == 0 && months == 0 && daysdiff > 0) {
      return {
        days: daysdiff,
      }
    }

    if (years == 0 && months != 0) {
      if (Math.sign(months) == -1) {
        return 'invalid Date'
      }
      else {
        if (daysdiff < 0) {
          return {
            months: months - 1,
            days: daysdiff + 30,
          }
        } else {
          return {
            months: months,
            days: daysdiff,
          }
        }
      }
    }

    if (years != 0) {
      if (Math.sign(years) == -1) {
        return 'invalid Date'
      }
      else {
        if (months == 0) {
          if (daysdiff == 0 || daysdiff < 0) {
            return 'Invalid Date'
          } else {
            if (daysdiff > 0) {
              return {
                years,
                months: 0,
                days: daysdiff,
              }
            }
          }
        }
        else {
          if (Math.sign(months) == -1) {
            return {
              years: years--,
            }
          }
          else {
            return {
              years: years,
              months: months,
            }
          }
        }
      }
    }

  }
}


export const BASEURL = 'http://localhost:5000/api/v1/patientid/'


export const registrationSchema = yup.object().shape({
  patienttype: yup.string().required('Patient Type is required'),
  emmergencyName: yup.string().required('Required'),
  patientid: yup.number(),
  email: yup.string().email('Invalid email'),
  relationship: yup.string().required('Required'),
  mobilenumber: yup.number(),
  emmergencyContactNumber: yup.number().required('required'),
  patienttype: yup.string().required('Required'),
  fullname: yup.string().required('Required'),
  day: yup.number(),
  years: yup.number(),
  months: yup.number(),
  age: yup.number(),
  ageType: yup.string(),
  gender: yup.string().required('Required'),
  maritalstatus: yup.string().required('Required'),
})

