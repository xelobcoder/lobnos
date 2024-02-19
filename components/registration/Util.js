import { customFetch, getApplicationSettings } from "../Auth/customFetch"

export const registration = [
   {
      title: 'personal information',
      fields: {
         email: true,
         mobile: true,
         age: true,
         days: true,
         months: true,
         years: true,
         gender: true,
         maritalstatus: true,
         ageType: true,
         firstname: true,
         lastname: true,
         middlename: true,
         patienttype: true,
         patientOrganization: true,
         occupation: true
      },
   },
   {
      title: 'address information', fields: {
         area: false,
         region: false,
         address: false,
         gpsLocation: true,
      }
   },
   {
      title: 'emmergency contact information',
      fields: {
         emmergencyName: false,
         emmergencyContactNumber: false,
         location: true,
         address: true,
         occupation: true,
         relationship: false,
      }
   }
]




export const getRegistrationFields = async (setState, toast) => {
   try {
      const data = await customFetch("applicationsettings/registration/fields");
      const { result, status } = data;
      if (status == "success" && result.length > 0) {
         const { fields } = result[0];
         if (fields == "{}") {
            if (setState) {
               setState(registration);
            } else {
               return registration
            }
         }
         if (setState) {
            setState(JSON.parse(fields));
         } else {
            return JSON.parse(fields);
         }
      }
   } catch (err) {
      if (setState) setState(registration);
      if (toast) { toast.error("something wrong occured", { autoClose: 2000 }) }
   }
}