import { customFetch } from "../../Auth/customFetch"

export const registration = [
   {
      title: 'personal information',
      fields: {
         firstname: 'compulsory',
         lastname: 'compulsory',
         age: 'compulsory',
         ageType: 'compulsory',
         gender: 'compulsory',
         middlename: 'compulsory',
         email: true,
         mobile: true,
         days: true,
         months: true,
         years: true,
         maritalstatus: true,
         refered: true,
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
         emmergencyContactName: false,
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
         if (setState) {
            setState(JSON.parse(fields));
         } else {
            return JSON.parse(fields);
         }
      } else {
         if (setState) {
            setState(registration);
         } else {
            return registration
         }
      }
   } catch (err) {
      if (setState) setState(registration);
      if (toast) { toast.error("something wrong occured", { autoClose: 2000 }) }
   }
}