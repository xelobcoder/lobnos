import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import React, { useEffect, useRef, useMemo } from "react";
import { customFetch } from "../../components/Auth/customFetch";
import { useRouter } from "next/router";
import style from "../../styles/registration.module.css";
import { handleAge, handleMobile, handleSubmitRegistration, BASEURL, handleEmail } from "../../components/Auth/registerclient";
import {
  Button, Box, Container, Grid, Typography, FormLabel, RadioGroup, FormControlLabel, FormControl, Select, InputLabel, MenuItem, TextField, Radio, IconButton
} from "@mui/material";
import { Home, PersonPinCircle } from "@mui/icons-material";
export const defaultdata = {
  email: "",
  mobile: "",
  age: "",
  days: "",
  months: "",
  years: "",
  patientid: "",
  patienttype: "",
  relationship: "",
  emmergencyName: "",
  emmergencyContactNumber: "",
  gender: "",
  maritalstatus: "",
  ageType: "",
  organization: "",
  clinician: "",
  patientOrganization: "",
  occupation: "",
  firstname: "",
  lastname: "",
  area: "",
  region: "",
  address: "",
}

// import { useFormik } from 'formik';
function Registration({ organization, clinician }) {
  const [title, setTitle] = React.useState("Personal Information");
  const [personalSection, setPersonalSection] = React.useState(true);
  const [sampling, setSampling] = React.useState(true);
  const [error, setError] = React.useState("");
  const patientIdRef = useRef(null);
  const generateRef = useRef(null);
  const patientTypeOptions = ["", "Direct", "Refered"];



  const [data, setData] = React.useState(defaultdata);

  const [disable, setDisable] = React.useState(false);
  const [generatebtn, setGeneratebtn] = React.useState(false);


  // generate a transaction id for the patient

  const generateTransactionId = (e) => {
    // generating unique id using the current timestamp,
    // could change it to UUID in the future
    let transactionId = Date.now();
    //  empty field first , then --- next code line
    setData({ ...data, patientid: "" });
    // fill patientid filled with generated value
    setData({ ...data, patientid: transactionId });

    // disabled button after first generation
    e.target.disabled = true;
    // disable the patient field, hence prevent editing the unique id
    patientIdRef.current = true;
    // toggle it
    patientIdRef.current == true ? setDisable(!disable) : null;
  };

  // calculate age based on the provided date of birth

  useEffect(() => {
    const CalculateAge = (e) => {
      // grap data from age calculator
      let agecalulation = handleAge(data.years, data.months, data.days);
      // if age calculor contains values
      if (agecalulation) {
        const { years, months, days } = agecalulation;
        if (years == 0 && months == 0 && days == 0) {
          if (data.days > new Date().getDate()) {
            setError(
              "Please kindly recheck date values entered, Error at day value!!!"
            );
            setData({ ...data, age: 0, ageType: "days" });
          } else {
            setError("Todays Delivering ?");
            setData({ ...data, age: days, ageType: "days" });
          }
        }
        if (years != 0) {
          setError("");
          setData({ ...data, age: years, ageType: "years" });
        }

        if (years == 0 && months != 0) {
          setError("");
          setData({ ...data, age: months, ageType: "months" });
        }

        if (years == 0 && months == 0 && days > 0) {
          setError("");
          setData({ ...data, age: days, ageType: "days" });
        }
      }
      // if invalid date is returned after analyisis,
      // update fields to suit

      if (agecalulation == "invalid Date") {
        setError("Invalid Date entered");
        setData({
          ...data,
          age: 0,
          days: 0,
          months: 0,
          years: 0,
          ageType: "",
        });
      }
    };

    CalculateAge();
  }, [data.years, data.age, data.ageType]);

  //   for updating field forms using client id
  const clientID = useRouter().query.patientid;

  useMemo(() => {
    if (clientID) {
      // fetch data of client with such patientid
      const getpatient_info = async function () {
        return await customFetch(`register?patientid=${clientID}`);
      };

      getpatient_info()
        .then((item) => {
          let data = item[0];
          // split full name into first and last name
          setData({
            patientid: data.PATIENTID,
            patienttype: data.PATIENTTYPE,
            relationship: data.RELATIONSHIP,
            emmergencyName: data.EMMERGENCY_CONTACT,
            emmergencyContactNumber: data.EMMERGENCY_CONTACT_NAME,
            age: data.AGE,
            ageType: data.AGETYPE,
            patientOrganization: data.PATIENTORGANIZATION || "",
            occupation: data.OCCUPATION || "",
            mobile: data.MOBILE_NUMBER,
            email: data.EMAIL,
            days: data.DOB.split("-")[2].slice(0, 2),
            months: data.DOB.split("-")[1].slice(0, 2),
            years: data.DOB.split("-")[0],
            maritalstatus: data.MARITAL_STATUS,
            gender: data.GENDER,
            firstname: data.FIRSTNAME,
            lastname: data.LASTNAME,
            middlename: data.MIDDLENAME,
            area: data.AREA,
            region: data.REGION,
            address: data.ADDRESS
          });

          // disable the patient field, hence prevent editing the unique id
          patientIdRef.current = true;
          // toggle it
          patientIdRef.current == true ? setDisable(!disable) : null;

          // set the title of the form to reflect the client's name
          setTitle(data.FULLNAME);

          // disable generate button

          generateRef.current = true;

          // toggle it

          generateRef.current == true ? setGeneratebtn(!disable) : null;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [clientID]);

  return (
    <>
      <form className="p-4">
        {!personalSection ? null : (
          <>
            {/* <Box sx={{width:'100%',marginTop:'20px'}}>
          <TextField variant='filled' type='text'/>
        </Box> */}
            <div id={style.registration_generate} className="alert alert-warning">
              <button
                ref={generateRef}
                sx={{ marginLeft: "10px" }}
                disabled={generatebtn}
                className="btn btn-danger text-capitalize text-white"
                onClick={(e) => generateTransactionId(e)}
                tabIndex={1}
                autoFocus
              >
                add new client
              </button>
              <input
                value={data.patientid}
                disabled={disable}
                sx={{ marginLeft: "30%" }}
                className="custom-input"
                placeholder="generated patient id here "
                onChange={(e) =>
                  setData({ ...data, patientid: e.target.value })
                }
              />
            </div>
            <div className='card' id="card-border">
              <div className="card-header">
                <IconButton sx={{ color: 'red' }} size="large">
                  <PersonPinCircle />
                </IconButton>
                <h5>Personal Information</h5>
              </div>
              <div className="card-body">
                <label>first name </label>
                <input
                  onChange={(e) => {
                    setData({ ...data, firstname: e.target.value });
                  }}
                  placeholder="firstname"
                  className="custom-input"
                  value={data.firstname}
                  type="text"
                  size='small'
                  required
                  tabIndex={2}
                />
                <label>last name </label>
                <input
                  className="custom-input"
                  type="text"
                  label="lastname"
                  placeholder="lastname"
                  required
                  value={data.lastname}
                  onChange={(e) => {
                    setData({ ...data, lastname: e.target.value });
                  }}
                  tabIndex={3}
                />

                <label>middle name</label>
                <input
                  className="custom-input"
                  tabIndex={4}
                  placeholder="middlename"
                  type="text"
                  value={data.middlename}
                  onChange={(e) => {
                    setData({ ...data, middlename: e.target.value });
                  }}
                />
                <label>mobile number </label>
                <input
                  type="number"
                  maxLength={10}
                  minLength={10}
                  required
                  value={data.mobile}
                  name="mobilenumber"
                  className="custom-input"
                  label="mobile number"
                  tabIndex={5}
                  onChange={(e) => {
                    handleMobile(e, setData, data, setError);
                  }}
                />
                <label>email</label>
                <input
                  size="small"
                  type="email"
                  value={data.email}
                  className="custom-input"
                  tabIndex={6}
                  name="email"
                  onChange={(e) => handleEmail(e, setData, data, setError)}
                  label="email"
                />
                <label>Date of Birth</label>
                <FormControl className={style.age}>
                  <input
                    className="custom-input"
                    type="number"
                    value={data.days}
                    tabIndex={7}
                    placeholder="days"
                    onChange={(e) => {
                      setData({ ...data, days: e.target.value });
                    }}
                    label="day"
                    name="day"
                  />
                  <input
                    className="custom-input"
                    label="months"
                    type="number"
                    placeholder="months"
                    tabIndex={8}
                    name="months"
                    value={data.months}
                    onChange={(e) => {
                      setData({ ...data, months: e.target.value });
                    }}
                  />
                  <input
                    className="custom-input"
                    value={data?.years}
                    onChange={(e) => {
                      setData({ ...data, years: e.target.value });
                    }}
                    placeholder="years"
                    tabIndex={9}
                  />
                </FormControl>
                <label>age</label>
                <input
                  value={data?.age}
                  onChange={(e) => setData({ ...data, age: e.target.value })}
                  type="number"
                  tabIndex={10}
                  className="custom-input"
                  placeholder="age"
                />
                <label>age type</label>
                <select
                  className="custom-input"
                  tabIndex={11}
                  onChange={(e) =>
                    setData({ ...data, agetype: e.target.value })
                  }
                  value={data.agetype}
                >
                  <option value="years">years</option>
                  <option value="months">months</option>
                  <option value="days">days</option>
                </select>
                <FormControl
                  style={{ display: "flex", justifyContent: "flex-start" }}
                >
                  <FormLabel name="gender">Gender</FormLabel>
                  <RadioGroup
                    aria-labelledby="gender"
                    defaultValue="female"
                    name="gender"
                    tabIndex={12}
                    onChange={(e) => setData({ ...data, gender: e.target.value })}
                    value={data.gender}
                  >
                    <div>
                      <FormControlLabel
                        value="female"
                        control={<Radio />}
                        tabIndex={13}
                        label="Female"
                      />
                      <FormControlLabel
                        value="male"
                        control={<Radio />}
                        tabIndex={14}
                        label="Male"
                      />
                      <FormControlLabel
                        value="other"
                        control={<Radio />}
                        tabIndex={15}
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
                    tabIndex={16}
                    name="maritalstatus"
                    onChange={(e) =>
                      setData({ ...data, maritalstatus: e.target.value })
                    }
                    value={data.maritalstatus}
                  >
                    <div>
                      <FormControlLabel
                        value="single"
                        control={<Radio />}
                        tabIndex={17}
                        label="Single"
                      />
                      <FormControlLabel
                        value="married"
                        control={<Radio />}
                        tabIndex={18}
                        label="Married"
                      />
                    </div>
                  </RadioGroup>
                </FormControl>
              </div>
            </div>


            <div className='card mt-4' id="card-border">
              <div className="card-header">
                <IconButton sx={{ color: 'red' }} size="large">
                  <Home />
                </IconButton>
                <h5>Address Information && contact info</h5>
              </div>
              <div className="card-body">
                <label>Area</label>
                <input className="custom-input"
                  value={data.area}
                  onChange={(e) => setData({ ...data, area: e.target.value })}
                  placeholder="area"
                  tabIndex={19}
                  type='text' />
                <label>Region</label>
                <input className="custom-input"
                  value={data.region}
                  onChange={(e) => setData({ ...data, region: e.target.value })}
                  placeholder="region"
                  tabIndex={20}
                  type='text' />
                <label>GPS Location  or landmark</label>
                <input className="custom-input"
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  tabIndex={21}
                  placeholder="gps location" type='text' />
                <div className="mb-3">
                  <label htmlFor="emergencyName" className="form-label">
                    Emergency contact name
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    id="emergencyName"
                    name="emergencyName"
                    tabIndex={22}
                    value={data.emergencyName}
                    onChange={(e) => {
                      setData({ ...data, emergencyName: e.target.value });
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="relationship" className="form-label">
                    Relationship
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    id="relationship"
                    name="relationship"
                    tabIndex={23}
                    value={data.relationship}
                    onChange={(e) => setData({ ...data, relationship: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="emergencyContactNumber" className="form-label">
                    Emergency contact number
                  </label>
                  <input
                    type="tel"
                    className="custom-input"
                    id="emergencyContactNumber"
                    name="emergencyContactNumber"
                    tabIndex={24}
                    value={data.emergencyContactNumber}
                    onChange={(e) =>
                      setData({ ...data, emergencyContactNumber: e.target.value })
                    }
                  />

                </div>
                <div className="mb-3">
                  <label htmlFor="patientOrganization" className="form-label">
                    Patient organization
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    id="patientOrganization"
                    name="patientOrganization"
                    tabIndex={25}
                    value={data.patientOrganization}
                    onChange={(e) => {
                      setData({ ...data, patientOrganization: e.target.value });
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="occupation" className="form-label">
                    Occupation
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    id="occupation"
                    name="occupation"
                    tabIndex={26}
                    value={data.occupation}
                    onChange={(e) => {
                      setData({ ...data, occupation: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>


            <Box sx={{ mt: 3 }}>
              <Button
                type="button"
                variant="contained"
                tabIndex={27}
                onClick={(e) => {
                  const typer = clientID === undefined || clientID === null ? 'POST' : 'PUT';
                  handleSubmitRegistration(e, data, typer, setData);
                }}
              >
                submit
              </Button>
            </Box>
          </>
        )}
      </form>
    </>
  );
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
        <div className="main">{page}</div>
      </div>
    </>
  )
}
