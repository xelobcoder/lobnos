import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import React from 'react'
import {
  handleAge,
  handleMobile,
  registrationSchema,
  BASEURL,
  handleEmail,
} from '../../components/Auth/registerclient'
import {
  Button,
  Box,
  Container,
  Grid,
  Typography,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  TextField,
  Radio,
  Autocomplete,
} from '@mui/material'
import yup from 'yup'
import { useFormik } from 'formik'

function Registration({ organization, clinician }) {
  const [title, setTitle] = React.useState('Personal Information')
  const [personalSection, setPersonalSection] = React.useState(true)
  const [sampling, setSampling] = React.useState(true)
  const [error, setError] = React.useState('')
  const [data, setData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    age: '',
    days: '',
    months: '',
    years: '',
    patientid: '',
    patienttype: '',
    relationship: '',
    emmergencyName: '',
    emmergencyContactNumber: '',
    samplingCenter: '',
    gender: '',
    maritalstatus: '',
    organization: '',
    clinician: '',
  })

  const handlePatientid = (e) => {
    let inputvalue = data.patientid
    // check for null value or empty value or undedined
    if (inputvalue != null || inputvalue != '' || inputvalue != undefined) {
      setData({ ...data, patientid: inputvalue })
      // query database for available patientid
      // if patientid is available then populate the form with the data
      const getpatient_info = async function () {
        let BASE = await fetch(`${BASEURL}${inputvalue}`)
        return BASE.json()
      }
      getpatient_info()
    }
  }
  // calculate age based on the provided date of birth

  const CalculateAge = (e) => {
    let value = e.target.value
    if (value.length > 4) {
      setData({ ...data, years: e.target.value })
      setError('4 digits only')
    } else if (value.length < 4) {
      setData({ ...data, years: e.target.value })
      setError('4 digits only')
    } else {
      setError('')
      setData({ ...data, years: e.target.value })
    }

    // let agecalulation = handleAge(data.years, data.months, data.days);
    // console.log(agecalulation)
  }

  // generate a transaction id for the patient

  const generateTransactionId = (e) => {
    let transactionId = Date.now()
    setData({ ...data, patientid: '' })
    setData({ ...data, patientid: transactionId })
    e.target.disabled = true
  }

  const formik = useFormik({
    initialValues: {
      emmergencyName: '',
      patientid: '462520255225522',
      email: '',
      relationship: '',
      mobilenumber: '',
      emmergencyContactNumber: '050505',
      patienttype: 'Direct',
      age: '',
      ageType: '',
      fullname: 'years',
      day: '',
      months: '',
      years: '1992',
      maritalstatus: '',
      gender: '',
      organization: '',
      clinician: '',
      samplingCenter: 'Branch B',
    },
    validationSchema: registrationSchema,
    onSubmit: (values) => {
      console.log(values)
    },
  })

  return (
    <>
      <Typography variant="p" color="error" sx={{ m: 2, marginTop: '5px' }}>
        {error}
      </Typography>
      <hr></hr>
      <form style={{ margin: '1% 3% 0% 3%' }} onSubmit={formik.handleSubmit}>
        {!personalSection ? null : (
          <>
            {/* <Box sx={{width:'100%',marginTop:'20px'}}>
          <TextField variant='filled' type='text'/>
        </Box> */}
            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '65% auto',
                gridGap: '20px 20px',
              }}
            >
              <TextField
                size="small"
                variant="outlined"
                type="number"
                name="patientid"
                label="patient id"
                value={data.patientid}
                onChange={(e) =>
                  setData({ ...data, patientid: e.target.value })
                }
              />
              <div>
                <Button onClick={(e) => handlePatientid(e)} variant="contained">
                  search
                </Button>
                <Button
                  onClick={(e) => generateTransactionId(e)}
                  variant="outlined"
                >
                  generate transactionid
                </Button>
              </div>
            </Box>
            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '50% auto',
                gridGap: '20px 20px',
                m: 1,
              }}
            >
              <FormControl
                variant="outlined"
                sx={{ m: 1, minWidth: 120 }}
                size="small"
              >
                <InputLabel id="patienttype">Patient Type</InputLabel>
                <Select
                  id="patienttype"
                  value={data.patienttype}
                  onChange={(e) =>
                    setData({ ...data, patienttype: e.target.value })
                  }
                  name="patienttype"
                  labelId="patienttype"
                >
                  <MenuItem value={'Direct'}>Direct</MenuItem>
                  <MenuItem value={'Indirect'}>Indirect</MenuItem>
                </Select>
              </FormControl>
              <TextField
                onChange={(e) => {
                  setData({ ...data, fullname: e.target.value })
                }}
                variant="outlined"
                type="text"
                label="Patient fullname"
                name="fullname"
                values={data.fullname}
                size="small"
              />

              <TextField
                size="small"
                type="number"
                variant="outlined"
                value={data.mobile}
                name="mobilenumber"
                inputProps={{ 'aria-label': 'number should begin with 0' }}
                label="mobile number"
                onChange={(e) => {
                  handleMobile(e, setData, data, setError)
                }}
              />
              {/* {formik.errors.mobilenumber} */}
              <TextField
                size="small"
                type="email"
                variant="outlined"
                name="email"
                onChange={(e) => handleEmail(e, setData, data, setError)}
                label="email"
              ></TextField>
            </Box>
            <Box
              sx={{ m: 1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '10% 30% auto 30%',
                gridGap: '20px 20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <InputLabel>Date of Birth</InputLabel>
              </div>
              <FormControl
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '35% 35% auto',
                  gridGap: '20px 20px',
                }}
              >
                <TextField
                  size="small"
                  type="number"
                  value={data.day}
                  onChange={(e) => {
                    setData({ ...data, day: e.target.value })
                  }}
                  label="day"
                  name="day"
                />
                <TextField
                  size="small"
                  label="months"
                  type="number"
                  name="months"
                  values={data.months}
                  onChange={(e) => {
                    setData({ ...data, months: e.target.value })
                  }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="years"
                  name="years"
                  value={data.years}
                  onChange={(e) => {
                    CalculateAge(e)
                  }}
                />
              </FormControl>
              <TextField
                placeholder="30"
                name="age"
                type="number"
                size="small"
                label="age in years"
                values={data.age}
                onChange={(e) => {
                  setData({ ...data, age: e.target.value })
                }}
              ></TextField>
              <FormControl>
                <InputLabel id="ageType">Age Type</InputLabel>
                <Select
                  name="ageType"
                  id="ageType"
                  value={formik.values.ageType}
                  size="small"
                  onChange={formik.handleChange}
                >
                  <MenuItem value={'years'}>years</MenuItem>
                  <MenuItem value={'months'}>months</MenuItem>
                  <MenuItem value={'days'}>days</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl
                style={{ display: 'flex', justifyContent: 'flex-start' }}
              >
                <FormLabel name="gender">Gender</FormLabel>
                <RadioGroup
                  aria-labelledby="gender"
                  defaultValue="female"
                  name="gender"
                  onChange={formik.handleChange}
                  values={formik.values.gender}
                >
                  <div>
                    <FormControlLabel
                      value="female"
                      control={<Radio />}
                      label="Female"
                    />
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="Male"
                    />
                    <FormControlLabel
                      value="other"
                      control={<Radio />}
                      label="Other"
                    />
                  </div>
                </RadioGroup>
              </FormControl>
              <FormControl>
                {/* marital status */}
                <FormLabel id="marital-status">Marital Status</FormLabel>
                <RadioGroup
                  aria-labelledby="marital-status"
                  defaultValue="single"
                  name="maritalstatus"
                  onChange={formik.handleChange}
                  value={formik.values.maritalstatus}
                >
                  <div>
                    <FormControlLabel
                      value="single"
                      control={<Radio />}
                      label="Single"
                    />
                    <FormControlLabel
                      value="married"
                      control={<Radio />}
                      label="Married"
                    />
                  </div>
                </RadioGroup>
              </FormControl>
            </Box>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '50% auto',
                m: 1,
                gridGap: '20px 20px',
              }}
            >
              <Autocomplete
                options={organization.map((option) => option.NAME)}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="organization name"
                    InputProps={{
                      ...params.InputProps,
                      type: 'search',
                    }}
                  />
                )}
              />
              <Autocomplete
                options={clinician.map((option) => option.NAME)}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="clinician name"
                    InputProps={{
                      ...params.InputProps,
                      type: 'search',
                    }}
                  />
                )}
              />
            </Box>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '30% auto 30%',
                marginTop: '30px',
                gridGap: '20px 20px',
              }}
            >
              <TextField
                label="emmergency contact name"
                variant="outlined"
                name="emmergencyName"
                onChange={formik.handleChange}
                value={formik.values.emmergencyName}
                type="text"
                size="small"
              />
              <TextField
                label="relationship"
                value={formik.values.relationship}
                onChange={formik.handleChange}
                variant="outlined"
                name="relationship"
                type="text"
                size="small"
              />
              <TextField
                label="emmergency contact number"
                variant="outlined"
                name="emmergencyContactNumber"
                onChange={formik.handleChange}
                value={formik.values.emmergencyContactNumber}
                type="tel"
                id=" emmergencyContactNumber"
                size="small"
              />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained">
                submit
              </Button>
            </Box>
          </>
        )}
        {sampling ? (
          <>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: '50% 50%',
                marginTop: '30px',
              }}
            >
              <FormControl size="small">
                <InputLabel>Sampling center</InputLabel>
                <Select
                  value={formik.values.samplingCenter}
                  name="samplingCenter"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="Branch A">Branch A</MenuItem>
                  <MenuItem value="Branch B">Branch B</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </>
        ) : null}
      </form>
    </>
  )
}

export default Registration

export async function getServerSideProps(context) {
  const getorganization = await fetch('http://localhost:3000/api/organization')
  const organization = await getorganization.json()
  const getclinician = await fetch('http://localhost:3000/api/clinicians')
  const clinician = await getclinician.json()
  return {
    props: {
      organization,
      clinician,
    },
  }
}

Registration.getLayout = function (page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <SidebarFrontPage />
        </div>
        <div className="main">{page}</div>
      </div>
    </>
  )
}
