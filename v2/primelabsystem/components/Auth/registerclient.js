import { customFetch, customPost } from "../../lib/customFetch";
import moment from 'moment';

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



export const handleAgeCalculations = async (data, setValue) => {
  const personalParams = { ...data };
  const { years, months, days } = personalParams;
  let ageCalculation = handleAge(years, months, days);

  if (ageCalculation && ageCalculation !== "invalid Date") {
    const { years: calcYears, months: calcMonths, days: calcDays } = ageCalculation;

    if (calcYears == 0 && calcMonths == 0 && calcDays == 0) {
      if (Number(data.days) > new Date().getDate()) {
        setValue("age", 0);
        setValue("ageType", "days");
      } else {
        setValue("age", calcDays);
        setValue("ageType", "days");
      }
    } else if (calcYears !== 0) {
      setValue("age", calcYears);
      setValue("ageType", "years");
    } else if (calcYears == 0 && calcMonths !== 0) {
      setValue("age", calcMonths);
      setValue("ageType", "months");
    } else if (calcYears == 0 && calcMonths == 0 && calcDays > 0) {
      setValue("age", calcDays);
      setValue("ageType", "days");
    }
  }

  if (ageCalculation === "invalid Date") {
    setValue("age", 0);
    setValue("days", 0);
    setValue("months", 0);
    setValue("years", 0);
    setValue("ageType", "");
  }
};

export const fieldValidator = (fieldName, data, fields, value) => {
  const visbiiltyObject = fields[fieldName];
  if (!visbiiltyObject || typeof visbiiltyObject != "object") return;
  const { compulsory } = visbiiltyObject;
  const hasFieldName = data[fieldName];
  if ((compulsory && !hasFieldName) || (compulsory && !value) || (compulsory && value.toString().length < 1)) return false;
  return true;
}


export async function handleActivation(status, patientid, toast, callbackfunction) {
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
  const status = action == 'TRUE' ? 'activate' : ' deactivate';
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
    desgination: "Mr",
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
    nationality: "",
    district: '',
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
  },
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



