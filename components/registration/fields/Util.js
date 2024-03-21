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
      const len = Object.keys(data).length > 0;
      if (len) {
         if (setState) {
            return setState(data);
         }
         return data;
      } else {
         if (setState) return setState(data)
         else return data;
      }
   } catch (err) {
      if (setState) setState(registration);
      if (toast) { toast.error("something wrong occured", { autoClose: 2000 }) }
   }
}