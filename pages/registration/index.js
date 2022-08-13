import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import React from 'react';
import { handleAge, handleMobile } from '../../components/Auth/registerclient';
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
} from '@mui/material'
import { useFormik } from 'formik'

function Registration() {
  const [title, setTitle] = React.useState('Personal Information')
  const [personalSection, setPersonalSection] = React.useState(true)
  const [sampling, setSampling] = React.useState(true);
  const [valuee, setValue] = React.useState(0);
  const [error,setError] = React.useState('')

  const formik = useFormik({
    initialValues: {
      emmergencyName: '',
      patientid: '462520255225522',
      email: '',
      relationship: '',
      mobilenumber: '',
      emmergencyContactNumber: '050505',
      patienttype: 'Direct',
      age: '00',
      fullname: '',
      day: '',
      months: '',
      years: '2000',
      maritalstatus: '',
      gender: '',
      organization: '',
      clinician: '',
      samplingCenter: 'Branch B',
    },
    validate: (values) => {
      const errors = {}
      if (!values.fullname) {
        errors.fullname = 'Fullname required '
      }




      return errors;
    },
    onSubmit: (values) => {
      console.log(values)
    },
  })

  

  return (
    <>
      <Typography variant="p" color="error">
       {
        error
       }
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
                gridTemplateColumns: '100%',
                gridGap: '20px 20px',
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
                  value={formik.values.patienttype}
                  onChange={formik.handleChange}
                  name="patienttype"
                  labelId="patienttype"
                >
                  <MenuItem value={'Direct'}>Direct</MenuItem>
                  <MenuItem value={'Indirect'}>Indirect</MenuItem>
                </Select>
              </FormControl>
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
              <TextField
                onChange={formik.handleChange}
                variant="outlined"
                type="text"
                label="Patient fullname"
                name="fullname"
                values={formik.values.fullname}
                size="small"
              />
              <TextField
                size="small"
                variant="outlined"
                type="number"
                name="patientid"
                label="patient id"
                values={formik.values.patientid}
                onChange={formik.handleChange}
              />
              <TextField
                size="small"
                type="number"
                variant="outlined"
                value={valuee}
                name="mobilenumber"
                inputProps={{ 'aria-label': 'number should begin with 0' }}
                label="mobile number"
                onChange={(e) => {
                  handleMobile(e,setValue,setError)
                }}
              />
              {/* {formik.errors.mobilenumber} */}
              <TextField
                size="small"
                type="email"
                variant="outlined"
                name="email"
                onChange={formik.handleChange}
                label="email"
              ></TextField>
            </Box>
            <Box
              sx={{ m: 1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '10% auto 30%',
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
                  value={formik.values.day}
                  onChange={formik.handleChange}
                  label="day"
                  name="day"
                />
                <TextField
                  size="small"
                  label="months"
                  type='number'
                  name="months"
                  values={formik.values.months}
                  onChange={formik.handleChange}
                />
                <TextField
                  size="small"
                  type="number"
                  label="years"
                  name="years"
                  value={formik.values.years}
                  onChange={
                    (e) => handleAge(formik.values.years,formik.values.months,
                      formik.values.day)
                  }
                />
              </FormControl>
              <TextField
                placeholder="30 years"
                name="age"
                type="number"
                size="small"
                label="age in years"
                values={formik.values.age}
                onChange={formik.handleChange}
              ></TextField>
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
              <FormControl name="organization" size="small">
                <InputLabel>refering organization</InputLabel>
                <Select
                  onChange={formik.handleChange}
                  id="orginization"
                  name="organization"
                  value={formik.values.organization}
                >
                  <MenuItem value={'Seventh Day Adventist Hospital'}>
                    Seventh Day Adventist Hospital
                  </MenuItem>
                  <MenuItem value={'Kpanvo Health Cneter'}>
                    Kpanvo Health Cneter
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>refering clinician</InputLabel>
                <Select
                  id="clinician"
                  name="clinician"
                  onChange={formik.handleChange}
                  value={formik.values.clinician}
                >
                  <MenuItem value="Dr paul isaac">Dr paul isaac</MenuItem>
                  <MenuItem value="Dr Jake Sinister">Dr Jake Sinister</MenuItem>
                </Select>
              </FormControl>
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
