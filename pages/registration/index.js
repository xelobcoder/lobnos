import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header'
import React, { useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
 handleAge,
 handleMobile,
 handleSubmitRegistration,
 BASEURL,
 handleEmail,
} from '../../components/Auth/registerclient'
import { BASE } from '../../endpoint';
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
import { useFormik } from 'formik';

function Registration({ organization, clinician }) {
 const [title, setTitle] = React.useState('Personal Information')
 const [personalSection, setPersonalSection] = React.useState(true)
 const [sampling, setSampling] = React.useState(true)
 const [error, setError] = React.useState('');
 const patientIdRef = useRef(null);
 const generateRef = useRef(null);
 const patientTypeOptions = ['', 'Direct', 'Refered'];

 const [data, setData] = React.useState({
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
  gender: '',
  maritalstatus: '',
  ageType: '',
  organization: '',
  clinician: '',
  patientOrganization: '',
  occupation: '',
  fullname: '',
 })

 const [disable, setDisable] = React.useState(false);
 const [generatebtn, setGeneratebtn] = React.useState(false);

 const handlePatientid = (e) => {
  let inputvalue = data.patientid
  // check for null value or empty value or undedined
  if (inputvalue != null || inputvalue != '' || inputvalue != undefined) {
   setData({ ...data, patientid: inputvalue })
   // query database for available patientid
   // if patientid is available then populate the form with the data
   const getpatient_info = async function () {
    let BASE = await fetch(`http://localhost:3000/registration?${inputvalue}`)
    return BASE.json()
   }
   getpatient_info().then( (t) => {
    console.log(t)
   }).catch( (err) => console.log(err))

  }
 }

 // generate a transaction id for the patient

 const generateTransactionId = (e) => {
  // generating unique id using the current timestamp, 
  // could change it to UUID in the future
  let transactionId = Date.now()
  //  empty field first , then --- next code line
  setData({ ...data, patientid: '' })
  // fill patientid filled with generated value
  setData({ ...data, patientid: transactionId })

  // disabled button after first generation
  e.target.disabled = true
  // disable the patient field, hence prevent editing the unique id
  patientIdRef.current = true;
  // toggle it
  patientIdRef.current == true ? setDisable(!disable) : null;
 }

 // calculate age based on the provided date of birth



 useEffect(() => {
  const CalculateAge = (e) => {
   // grap data from age calculator
   let agecalulation = handleAge(data.years, data.months, data.days)
   // if age calculor contains values
   if (agecalulation) {
    const { years, months, days } = agecalulation
    if (years == 0 && months == 0 && days == 0) {
     if (data.days > new Date().getDate()) {
      setError(
       'Please kindly recheck date values entered, Error at day value!!!',
      )
      setData({ ...data, age: 0, ageType: 'days' })
     } else {
      setError('Todays Delivering ?')
      setData({ ...data, age: days, ageType: 'days' })
     }
    }
    if (years != 0) {
     setError('')
     setData({ ...data, age: years, ageType: 'years' })
    }

    if (years == 0 && months != 0) {
     setError('')
     setData({ ...data, age: months, ageType: 'months' })
    }

    if (years == 0 && months == 0 && days > 0) {
     setError('')
     setData({ ...data, age: days, ageType: 'days' })
    }
   }
   // if invalid date is returned after analyisis,
   // update fields to suit

   if (agecalulation == 'invalid Date') {
    setError('Invalid Date entered')
    setData({
     ...data, age: 0, days: 0, months: 0, years: 0, ageType: '',
    })
   }
  }

  CalculateAge()
 }, [data.years, data.age, data.ageType]);

 //   for updating field forms using client id
 const clientID = useRouter().query.patientid;


 useMemo(() => {
  if (clientID) {
   // fetch data of client with such patientid
   const getpatient_info = async function () {
    let BASE = await fetch(`http://localhost:3000/api/register/?patientid=${clientID}`)
    return await BASE.json()
   }

   getpatient_info().then((item) => {
    let data = item[0];
    setData({
     patientid: data.PATIENTID,
     patienttype: data.PATIENTTYPE,
     relationship: data.RELATIONSHIP,
     emmergencyName: data.EMMERGENCY_CONTACT,
     emmergencyContactNumber: data.EMMERGENCY_CONTACT_NAME,
     age: data.AGE,
     ageType: data.AGETYPE,
     organization: data.ORGANIZATION || '',
     clinician: data.CLINICIAN || '',
     patientOrganization: data.PATIENTORGANIZATION || '',
     occupation: data.OCCUPATION || '',
     mobile: data.MOBILE_NUMBER,
     email: data.EMAIL,
     days: data.DOB.split('-')[2].slice(0, 2),
     months: data.DOB.split('-')[1].slice(0, 2),
     years: data.DOB.split('-')[0],
     maritalstatus: data.MARITAL_STATUS,
     gender: data.GENDER,
     fullname: data.FULLNAME,
    })

    // disable the patient field, hence prevent editing the unique id
    patientIdRef.current = true;
    // toggle it
    patientIdRef.current == true ? setDisable(!disable) : null;

    // set the title of the form to reflect the client's name
    setTitle(data.FULLNAME)

    // disable generate button

    generateRef.current = true;

    // toggle it

    generateRef.current == true ? setGeneratebtn(!disable) : null;
   })
    .catch((err) => {
     console.log(err)
    })
  }
 }, [clientID])

 return (
  <>
   <Typography variant="p" color="error" sx={{ m: 2, marginTop: '5px' }}>
    {error}
   </Typography>
   <hr></hr>
   <form style={{ margin: '1% 3% 0% 3%' }}>
    {!personalSection ? null : (
     <>
      {/* <Box sx={{width:'100%',marginTop:'20px'}}>
          <TextField variant='filled' type='text'/>
        </Box> */}
      <Box
       sx={{
        width: '100%',
        display: 'grid',
        m: 1,
        gridTemplateColumns: '65% auto',
        gridGap: '20px 20px',
       }}
      >
       <TextField size="small" variant="outlined" type="number" name="patientid" inputRef={patientIdRef}
        label="patient id"
        value={data.patientid}
        disabled={disable}
        onChange={(e) =>
         setData({ ...data, patientid: e.target.value })
        }
       />
       <div sx={{ display: 'grid', gridTemplateColumns: '50% auto', gridGap: '20px 20px' }}>
        <Button
         disabled={generatebtn}
         onClick={(e) => handlePatientid(e)} variant="contained">
         search
        </Button>
        <Button ref={generateRef} sx={{ marginLeft: '10px' }} disabled={generatebtn} onClick={(e) => generateTransactionId(e)} variant="outlined">
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
       <Autocomplete
        options={patientTypeOptions.map((option) => option)}
        size="small"
        required
        autoComplete={true}
        value={data.patienttype}
        onChange={(e, newvalue) => { setData({ ...data, patienttype: newvalue }) }
        }
        renderInput={(params) => (
         <TextField
          {...params}
          label="patient type"
         />
        )}
       />
       <TextField
        onChange={(e) => {
         setData({ ...data, fullname: e.target.value })
        }}
        variant="outlined"
        type="text"
        label="Patient fullname"
        name="fullname"
        value={data.fullname}
        required
        size="small"
       />

       <TextField
        size="small"
        type="number"
        variant="outlined"
        maxLength={10}
        minLength={10}
        required
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
        value={data.email}
        name="email"
        onChange={(e) => handleEmail(e, setData, data, setError)}
        label="email"
       ></TextField>
      </Box>
      <Box
       sx={{ m: 1 }}
       style={{
        display: 'grid',
        gridTemplateColumns: '10% 40% auto 30%',
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
         value={data.days}
         onChange={(e) => {
          setData({ ...data, days: e.target.value })
         }}
         label="day"
         name="day"
        />
        <TextField
         size="small"
         label="months"
         type="number"
         name="months"
         value={data.months}
         onChange={(e) => {
          setData({ ...data, months: e.target.value })
         }}
        />
        <TextField
         size="small"
         type="number"
         label="years"
         name="years"
         maxLength={4}
         value={data.years}
         onChange={(e) => {
          setData({ ...data, years: e.target.value })
         }}
        />
       </FormControl>
       <TextField
        placeholder="30"
        name="age"
        type="number"
        size="small"
        label="age"
        value={data.age}
        onChange={(e) => setData({ ...data, age: e.target.value })}
       ></TextField>
       <FormControl>
        <InputLabel id="ageType">Age Type</InputLabel>
        <Select
         name="ageType"
         id="ageType"
         value={data.ageType}
         size="small"
         variant="outlined"
         onChange={(e) =>
          setData({ ...data, ageType: e.target.value })
         }
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
         onChange={(e) => setData({ ...data, gender: e.target.value })}
         value={data.gender}
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
         onChange={(e) =>
          setData({ ...data, maritalstatus: e.target.value })
         }
         value={data.maritalstatus}
        >
         <div>
          <FormControlLabel value="single" control={<Radio />} label="Single" />
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
        disabled={data.patienttype == 'Refered' ? false : true}
        options={organization.map((option) => option.NAME)}
        size="small"
        value={data.organization}
        onChange={(e, newvalue) => {
         setData({ ...data, organization: newvalue })
        }}
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
        disabled={data.patienttype == 'Refered' ? false : true}
        options={clinician.map((option) => option.NAME)}
        size="small"
        autoComplete={true}
        value={data.clinician}
        onChange={(e, newvalue) => { setData({ ...data, clinician: newvalue }) }
        }
        renderInput={(params) => (
         <TextField
          {...params}
          label="clinician name"
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
        onChange={(e) => {
         setData({ ...data, emmergencyName: e.target.value })
        }}
        value={data.emmergencyName}
        type="text"
        size="small"
       />
       <TextField
        label="relationship"
        value={data.relationship}
        onChange={(e) =>
         setData({ ...data, relationship: e.target.value })
        }
        variant="outlined"
        name="relationship"
        type="text"
        size="small"
       />
       <TextField
        label="emmergency contact number"
        variant="outlined"
        name="emmergencyContactNumber"
        onChange={(e) =>
         setData({ ...data, emmergencyContactNumber: e.target.value })
        }
        value={data.emmergencyContactNumber}
        type="tel"
        id=" emmergencyContactNumber"
        size="small"
       />
      </Box>
      <Box
       style={{
        display: 'grid',
        gridTemplateColumns: '50% auto',
        gridGap: '20px 20px',
        marginTop: '30px',
       }}
      >
       <TextField value={data.patientOrganization}
        label="patient organization"
        size='small'
        onChange={(e) => {
         setData({ ...data, patientOrganization: e.target.value })
        }
        }
       />
       <TextField value={data.occupation}
        label="occupation"
        size='small'
        onChange={(e) => {
         setData({ ...data, occupation: e.target.value })
        }}
       />
      </Box>
      <Box sx={{ mt: 3 }}>
       <Button
        type="button"
        variant="contained"
        onClick={
         (e) => { handleSubmitRegistration(e, data, 'http://localhost:3000/api/register') }
        }
       >
        submit
       </Button>
      </Box>
     </>
    )}

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
