import { customFetch, customPost } from "./customFetch";
import { defaultdata } from "../../pages/registration";
import moment from 'moment';
import { toast } from "react-toastify";

// handle mobile number validation
export const handleMobile = (e, toast) => {
  let value = e.target.value;
  let length = value.length;
  if (length > 10) {
    toast.warning("Maximum of 10 numbers required", { autoClose: 1000 })
  } else if (length < 10) {
    toast.warning("Minimum of 10 numbers required", { autoClose: 1000 });
  } else if (!value.startsWith(0)) {
    toast.error("Number must start with 0", { autoClose: 1000 });
  } else {
    return;
  }
};

export const handleEmail = (e, setValue, data, toast) => {
  let value = e.target.value;
  const pattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (value != "") {
    pattern.test(value) ? null : toast.error("invalid Email");
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
  if (y !== "" && m !== "" && d !== "") {
    const birthDate = moment({ year: y, month: m - 1, day: d });
    const today = moment();
    const years = today.diff(birthDate, 'years');
    const months = today.diff(birthDate, 'months') % 12;
    const days = today.diff(birthDate, 'days') % 30; // assuming 30 days in a month for simplicity

    if (years === 0 && months === 0 && days <= 0) {
      return {
        years: 0,
        months: 0,
        days: 0,
      };
    }

    return {
      years: years,
      months: months,
      days: days,
    };
  } else {
    return null;
  }
};



export const handleAgeCalculations = async (data, setData, toast) => {
  const personalParams = { ...data }
  const { years, months, days } = personalParams;
  let agecalulation = handleAge(years, months, days);
  // if age calculor contains values
  if (agecalulation) {
    const { years, months, days } = agecalulation
    if (years == 0 && months == 0 && days == 0) {
      if (data.days > new Date().getDate()) {
        toast.error(`Please kindly recheck date values entered, Error at day value!!!`, { autoClose: 500 })
        setData({ ...data, age: 0, ageType: "days" })
      } else {
        toast.info("Todays Delivering ?")
        setData({ ...personalParams, age: days, ageType: "days" })
      }
    }
    if (years != 0) {
      setData({ ...personalParams, age: years, ageType: "years" })
    }

    if (years == 0 && months != 0) {
      setData({ ...personalParams, age: months, ageType: "months", })
    }

    if (years == 0 && months == 0 && days > 0) {
      setData({ ...personalParams, age: days, ageType: "days" })
    }
  }
  // if invalid date is returned after analyisis,
  // update fields to suit

  if (agecalulation == "invalid Date") {
    toast.error("Invalid Date entered", { autoClose: 3000 })
    setData({ ...personalParams, age: 0, days: 0, months: 0, years: 0, ageType: "" })
  }
}


export const handleSubmitRegistration = async (e, data = {}, method, toast, callback, redirect) => {
  e.preventDefault();
  // error marker , at end run if true , data is not sent to endpoint.
  var error = false;
  // fields that must have values
  const requiredFields = ["firstname", "lastname", "age", "ageType", "gender"];
  // function theat checks to esnsure required fields are filled
  const checkRequiredFields = (data) => {
    requiredFields.forEach((field) => {
      console.log(data[field])
      if (data[field].toString().length == 0) {
        error = true;
        return;
      }
    });
  };

  checkRequiredFields(data);


  if (!error) {
    const endpoint = method === 'POST' ? 'register' : `register/personalinformation?patientid=${data?.patientid}`;
    const response = await customPost(endpoint, method, { data });
    const { status, statusCode, message, patientid } = response;

    if (statusCode == 200 && status == "success") {
      toast.success(message + ". Redirectly to billing page", { autoClose: 500 });
      callback();
      if (redirect && typeof redirect == "boolean") {
        setTimeout(() => {
          window.location.href = `/billing/patientid?patientid=${patientid}`;
        }, 1500)
      }
    } else {
      toast.error(message, { autoClose: 1000 });
      return;
    }
  } else { toast.warning('Fill in all Required Fields', { autoClose: 1000 }) }
};



export async function handleActivation(status, patientid,toast, callbackfunction) {
  let confirmation = confirm(`Do you want to ${status == 'FALSE' ? 'Activate' : 'deactivate'} client ?`);
  if (confirmation) {
    let action = status == "TRUE" ? "FALSE" : "TRUE";
    let response = await customFetch(
      `customer/activation/status/change?patientid=${patientid}&action=${action}`
    );
    if (response.status == true) {
      toast.success(`patient ${action == 'TRUE' ? 'Activated' : 'Deactivated'} successfully`);
      if (callbackfunction && typeof callbackfunction == 'function') {
        callbackfunction();
      }
      return response.status
    } else {
      toast.error(`patient ${action == 'TRUE' ? 'Activation' : 'Deactivation'} failed`)
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
    whatAppcontact: "",
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
    emmergencyContactName: "",
    emmergencyContactNumber: "",
    location: '',
    address: '',
    occupation: '',
    relationship: "",
  }
}





export const submitFormData = async function (endpoint, target, toast = null) {
  const pushResponse = await customPost(endpoint, 'PUT', target);
  const { statusCode, status, message } = pushResponse;
  if (statusCode == 200 && status == 'success') {
    if (toast) {
      toast.success(message, { autoClose: 500 })
    } else {
      alert(message)
    }
  }
}



