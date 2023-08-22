import { customFetch, customPost } from "./customFetch";
import { defaultdata } from "../../pages/registration";

// handle mobile number validation
export const handleMobile = (e, setValue, data, setError) => {
  let value = e.target.value;
  let length = value.length;
  setValue({ ...data, personalInformation: { ...data.personalInformation, mobile: value } });
  if (length > 10) {
    setError("Maximum of 10 numbers required");
  } else if (length < 10) {
    setError("Minimum of 10 numbers required");
  } else {
    setError("");
  }
  if (!value.startsWith(0)) {
    setError("Number must start with 0");
  }
};

export const handleEmail = (e, setValue, data, setError) => {
  let value = e.target.value;
  setValue({ ...data, personalInformation: { ...data.personalInformation, email: value } });
  const pattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (value != "") {
    pattern.test(value) ? setError("") : setError("invalid Email");
  }
};

// handle age validation
// automatically calculate age from day, month, year inputs if
// all are filled
// interested in years , months, day determined by the user
// if years is  greater than 0, then calculate age from years
// if years is 0, then calculate age from months
// if years is 0 and months is 0, then calculate age from days

export const handleAge = (y, m, d) => {
  if (y != "" && m != "" && d != "") {
    let date = new Date(y, m, d);
    let today = new Date();
    let years = today.getFullYear() - y;
    let months = today.getMonth() + 1 - m;
    let daysdiff = today.getDate() - d;

    if (years == 0 && months == 0 && daysdiff <= 0) {
      return {
        years: 0,
        months: 0,
        days: 0,
      };
    }

    if (years == 0 && months == 0 && daysdiff > 0) {
      return {
        years: 0,
        months: 0,
        days: daysdiff,
      };
    }

    if (years == 0 && months != 0) {
      if (Math.sign(months) == -1) {
        return "invalid Date";
      } else {
        if (daysdiff < 0) {
          return {
            months: months - 1,
            days: daysdiff + 30,
            years: 0,
          };
        } else {
          return {
            years: 0,
            months: months,
            days: daysdiff,
          };
        }
      }
    }

    if (years != 0) {
      if (Math.sign(years) == -1) {
        return "invalid Date";
      } else {
        if (months == 0) {
          if (daysdiff == 0) {
            return {
              years: years,
              months: 0,
              days: 0,
            };
          } else {
            if (daysdiff > 0) {
              return {
                years,
                months: 0,
                days: daysdiff,
              };
            } else {
              return {
                years: years - 1,
                months,
                daysdiff,
              };
            }
          }
        } else {
          if (Math.sign(months) == -1) {
            return {
              years: years - 1,
              months: today.getMonth() + 1,
              days: null,
            };
          } else {
            return {
              years: years,
              months: months,
              days: null,
            };
          }
        }
      }
    }
  } else {
    return null;
  }
};

export const handleSubmitRegistration = async (
  e,
  data = {},
  typer,
  callback
) => {
  e.preventDefault();
  // error marker , at end run if true , data is not sent to endpoint.
  var error = false;
  // fields that must have values
  const requiredFields = [
    "firstname",
    "lastname",
    "patientid",
    "age",
    "ageType",
    "maritalstatus",
    "mobile",
    "gender",
    "patientOrganization",
    "occupation",
  ];

  // function theat checks to esnsure required fields are filled
  const checkRequiredFields = (data) => {
    requiredFields.forEach((field) => {
      if (data.personalInformation[field] == "") {
        error = true;
        return;
      }
    });
  };

  checkRequiredFields(data);


  if (!error) {
    const response = await customPost("register", typer, data);
    const { status, statusCode, message, patientid } = response;

    if (statusCode == 200 && status == "SUCCESS") {
      // alert(message);
      callback(patientRegistrationDefaultData);
      window.location.href = `/activation?patientid=${patientid}`;
    } else {
      alert(message);
      return;
    }
  }
};

export async function handleActivation(e, id, status, patientid, callbackfunction) {
  let confirmation = confirm(`Do you want to ${status == 'FALSE' ? 'Activate' : 'deactivate'} client ?`);
  if (confirmation) {
    let action = status == "TRUE" ? "FALSE" : "TRUE";
    let response = await customFetch(
      `activation?patientid=${patientid}&action=${action}`
    );
    if (response.message == 'success') {
      alert(`patient ${action == 'TRUE' ? 'Activated' : 'Deactivated'} successfully`);
      callbackfunction();
    } else {
      alert(message)
    }
  } else {
    return;
  }
}





export async function ActivationBulk(e, action, callbackfunction) {
  const status = action == 'TRUE' ? 'activate' :' deactivate';
  const confirmation = confirm(`Do you want to ${status} all clients?`);
  if (confirmation) {
    let response = await customFetch(
      `activation/bulk?action=${action}`
    );

    if (response.message == 'success') {
      alert(`All patient ${action == 'TRUE' ? 'activated' : 'deactivated'} successfully`);
      callbackfunction();
    } else {
      alert(response.message)
    }
  }
}


export const patientRegistrationDefaultData = {
  personalInformation: {
    email: "",
    mobile: "",
    age: "",
    days: "",
    months: "",
    years: "",
    gender: "",
    maritalstatus: "",
    ageType: "",
    firstname: "",
    lastname: "",
    middlename: "",
    patienttype: "",
    patientOrganization: "",
    occupation: "",
  },
  addressingInformation: {
    area: "",
    region: "",
    address: "",
    gpsLocation: '',
  },
  emmergencyInformation: {
    emmergencyName: "",
    emmergencyContactNumber: "",
    location: '',
    address: '',
    occupation: '',
    relationship: "",
  }
}