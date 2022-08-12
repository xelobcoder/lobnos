import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import React from 'react';
import {
  Button, Box, Container, Grid, Typography,
  FormLabel, RadioGroup, FormControlLabel, FormControl, Select,
  InputLabel, MenuItem, TextField, Radio
} from "@mui/material";

function Registration() {
  const [title, setTitle] = React.useState('Personal Information');
  const [personalSection, setPersonalSection] = React.useState(true);
  const [sampling, setSampling] = React.useState(true);
  return (
    <>
      <Typography variant='h5' color='primary'>
        {title}
      </Typography>
      <hr></hr>
      <form style={{ margin: '1% 3% 0% 3%' }}>
        {!personalSection ? null : (
          <>
            {/* <Box sx={{width:'100%',marginTop:'20px'}}>
          <TextField variant='filled' type='text'/>
        </Box> */}
            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '100%', gridGap: '20px 20px' }}>
              <FormControl variant='outlined' sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id='patient-id'>Patient Type</InputLabel>
                <Select id='patient-id' labelId="patient-id">
                  <MenuItem value='Direct'>direct</MenuItem>
                  <MenuItem value='Indirect'>indirect</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: '50% auto', gridGap: '20px 20px', m: 1 }}>
              <TextField variant='outlined' type='text' label='Patient fullname' size='small' />
              <TextField size="small" variant='outlined' type='tell' label='patient id' />
              <TextField size='small' type='number' variant='outlined' inputProps={{ 'aria-label': 'number should begin with 0' }} label='mobile number' />
              <TextField size='small' type='email' variant='outlined' label='email'></TextField>
            </Box>
            <Box sx={{ m: 1 }} style={{ display: 'grid', gridTemplateColumns: '10% auto 30%', gridGap: '20px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <InputLabel>Date of Birth</InputLabel>
              </div>
              <FormControl sx={{ display: 'grid', gridTemplateColumns: '35% 35% auto', gridGap: '20px 20px' }} >
                <TextField size='small' type='number' label='day' />
                <TextField size='small' type='number' label='months' />
                <TextField size='small' type='number' label='years' />
              </FormControl>
              <TextField placeholder="30 years" type='number' size='small' label='age in years'></TextField>
            </Box>
            <Box>
              <FormControl style={{ display: 'flex', justifyContent: "flex-start" }}>
                <FormLabel id="gender">Gender</FormLabel>
                <RadioGroup
                  aria-labelledby="gender"
                  defaultValue="female"
                  name="radio-gender"
                >
                  <div>
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="other" control={<Radio />} label="Other" />
                  </div>
                </RadioGroup>
              </FormControl>
            </Box>
            <Box style={{ display: "grid", gridTemplateColumns: '50% auto',m:1,gridGap:'20px 20px' }}>
              <FormControl size="small">
                <InputLabel>
                  refering organization
                </InputLabel>
                <Select>
                  <MenuItem value='Seventh Day Adventist Hospital'>Seventh Day Adventist Hospital</MenuItem>
                  <MenuItem value='Kpanvo Health Cneter'>Kpanvo Health Cneter</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>
                  refering clinician
                </InputLabel>
                <Select>
                  <MenuItem value='Dr paul isaac'>Dr paul isaac</MenuItem>
                  <MenuItem value='Dr Jake Sinister'>Dr Jake Sinister</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </>
        )}
        {
          sampling ? (
            <>
              <Box style={{ display: "grid", gridTemplateColumns: '50% 50%' ,marginTop:'30px'}}>
                <FormControl size="small">
                  <InputLabel>
                    Sampling center
                  </InputLabel>
                  <Select>
                    <MenuItem value='Branch A'>Branch A</MenuItem>
                    <MenuItem value='Branch B'>Branch B</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </>
          ) : null
        }
      </form>
    </>
  )
}


export default Registration;


Registration.getLayout = function (page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <SidebarFrontPage />
        </div>
        <div className="main">
          {page}
        </div>
      </div>
    </>
  )
}