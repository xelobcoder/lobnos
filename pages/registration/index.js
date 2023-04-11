import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import React, { useEffect, useRef, useMemo } from "react";
import { customFetch } from "../../components/Auth/customFetch";
import { useRouter } from "next/router";
import style from "../../styles/registration.module.css";
import {
  handleAge,
  handleMobile,
  handleSubmitRegistration,
  BASEURL,
  handleEmail,
} from "../../components/Auth/registerclient";
import { BASE } from "../../endpoint";
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
} from "@mui/material";
// import { useFormik } from 'formik';
function Registration({ organization, clinician }) {
  const [title, setTitle] = React.useState("Personal Information");
  const [personalSection, setPersonalSection] = React.useState(true);
  const [sampling, setSampling] = React.useState(true);
  const [error, setError] = React.useState("");
  const patientIdRef = useRef(null);
  const generateRef = useRef(null);
  const patientTypeOptions = ["", "Direct", "Refered"];

  const [data, setData] = React.useState({
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
    fullname: "",
  });

  const [disable, setDisable] = React.useState(false);
  const [generatebtn, setGeneratebtn] = React.useState(false);

  const handlePatientid = async (e) => {
    let inputvalue = data.patientid;
    // check for null value or empty value or undedined
    if (inputvalue != null || inputvalue != "" || inputvalue != undefined) {
      setData({ ...data, patientid: inputvalue });
      // query database for available patientid
      // if patientid is available then populate the form with the data
      const getpatient_info = await customFetch(`registration?${inputvalue}`);
      console.log(getpatient_info);
      getpatient_info()
        .then((t) => {
          console.log(t);
        })
        .catch((err) => console.log(err));
    }
  };

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
          setData({
            patientid: data.PATIENTID,
            patienttype: data.PATIENTTYPE,
            relationship: data.RELATIONSHIP,
            emmergencyName: data.EMMERGENCY_CONTACT,
            emmergencyContactNumber: data.EMMERGENCY_CONTACT_NAME,
            age: data.AGE,
            ageType: data.AGETYPE,
            organization: data.ORGANIZATION || "",
            clinician: data.CLINICIAN || "",
            patientOrganization: data.PATIENTORGANIZATION || "",
            occupation: data.OCCUPATION || "",
            mobile: data.MOBILE_NUMBER,
            email: data.EMAIL,
            days: data.DOB.split("-")[2].slice(0, 2),
            months: data.DOB.split("-")[1].slice(0, 2),
            years: data.DOB.split("-")[0],
            maritalstatus: data.MARITAL_STATUS,
            gender: data.GENDER,
            fullname: data.FULLNAME,
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
            <Box id={style.registration_generate}>
              <Button
                ref={generateRef}
                sx={{ marginLeft: "10px" }}
                disabled={generatebtn}
                onClick={(e) => generateTransactionId(e)}
                variant="contained"
                tabIndex={1}
                autoFocus
              >
                generate patientid
              </Button>
              <div>
                <input
                  value={data.patientid}
                  disabled={disable}
                  className="custom-input"
                  placeholder="generated patient id here "
                  onChange={(e) =>
                    setData({ ...data, patientid: e.target.value })
                  }
                />
              </div>
            </Box>
            <Box className={style.personal}>
              <div>
                <label>first name </label>
                <input
                  onChange={(e) => {
                    setData({ ...data, fullname: e.target.value });
                  }}
                  placeholder="firstname"
                  className="custom-input"
                  value={data.fullname}
                  required
                  tabIndex={2}
                />
              </div>
              <div>
                <label>last name </label>
                <input
                  className="custom-input"
                  size="small"
                  label="lastname"
                  placeholder="lastname"
                  required
                  tabIndex={3}
                />
              </div>
              <div>
                <label>middle name</label>
                <input
                  className="custom-input"
                  tabIndex={4}
                  placeholder="middlename"
                  type="text"
                />
              </div>
              <div>
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
              </div>
              <div>
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
              </div>
            </Box>
            <Box className={style.maker}>
              <div>
                <label>Date of Birth</label>
              </div>
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
              <div className={style.age_desc}>
                <div>
                  <label>age</label>
                  <input
                    value={data?.age}
                    onChange={(e) => setData({ ...data, age: e.target.value })}
                    type="number"
                    tabIndex={10}
                    className="custom-input"
                    placeholder="age"
                  />
                </div>

                <FormControl sx={{ marginTop: '39px' }}>
                  <InputLabel id="ageType">Age Type</InputLabel>
                  <Select
                    name="ageType"
                    id="ageType"
                    value={data.ageType}
                    size="small"
                    variant="outlined"
                    tabIndex={11}
                    onChange={(e) =>
                      setData({ ...data, ageType: e.target.value })
                    }
                  >
                    <MenuItem value={"years"}>years</MenuItem>
                    <MenuItem value={"months"}>months</MenuItem>
                    <MenuItem value={"days"}>days</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </Box>
            <Box className={style.maker}>
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
            </Box>
            <h5 className="lims-text-color text-capitalize">
              geographical location information
            </h5>
            <Box className={style.personal}>
              <div>
                {/* area */}
                <label>Area</label>
                <input className="custom-input" placeholder="area" type='text' />
              </div>
            </Box>
            <h5 className="lims-text-color text-capitalize">
              emmergency contact information
            </h5>
            <Box className={style.personal}>
              <TextField
                label="emmergency contact name"
                variant="outlined"
                name="emmergencyName"
                tabIndex={19}
                onChange={(e) => {
                  setData({ ...data, emmergencyName: e.target.value });
                }}
                value={data.emmergencyName}
                type="text"
                size="small"
              />
              <TextField
                label="relationship"
                value={data.relationship}
                tabIndex={20}
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
                tabIndex={21}
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
            <Box>
              <TextField
                value={data.patientOrganization}
                label="patient organization"
                tabIndex={22}
                size="small"
                onChange={(e) => {
                  setData({ ...data, patientOrganization: e.target.value });
                }}
              />
              <TextField
                value={data.occupation}
                label="occupation"
                tabIndex={23}
                size="small"
                onChange={(e) => {
                  setData({ ...data, occupation: e.target.value });
                }}
              />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button
                type="button"
                variant="contained"
                tabIndex={24}
                onClick={(e) => {
                  handleSubmitRegistration(e, data, "register");
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




// Registration.getLayout = function (page) {
//   return (
//     <>
//       <Header />
//       <div className="wrapper">
//         <div className="side">
//           <SidebarFrontPage />
//         </div>
//         <div className="main">{page}</div>
//       </div>
//     </>
//   )
// }
