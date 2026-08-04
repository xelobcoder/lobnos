import { customFetch } from "../../Auth/customFetch"

export const registrationFields = {
   personalInformation: {
      designation: { visible: true, compulsory: true },
      email: { visible: true, compulsory: true },
      mobile: { visible: true, compulsory: true },
      age: { visible: true, compulsory: true },
      days: { visible: true, compulsory: true },
      months: { visible: true, compulsory: true },
      years: { visible: true, compulsory: true },
      gender: { visible: true, compulsory: true },
      whatAppcontact: { visible: true, compulsory: false },
      maritalstatus: { visible: true, compulsory: true },
      ageType: { visible: true, compulsory: true },
      firstname: { visible: true, compulsory: true },
      lastname: { visible: true, compulsory: true },
      middlename: { visible: true, compulsory: false },
      patienttype: { visible: true, compulsory: true },
      patientOrganization: { visible: true, compulsory: false },
      occupation: { visible: true, compulsory: false },
   },
   addressingInformation: {
      country: { visible: true, compulsory: true },
      area: { visible: true, compulsory: true },
      district: { visible: true, compulsory: true },
      region: { visible: true, compulsory: true },
      address: { visible: true, compulsory: true },
      gpsLocation: { visible: true, compulsory: false },
   },
   emmergencyInformation: {
      emmergencyContactName: { visible: true, compulsory: true },
      emmergencyContactNumber: { visible: true, compulsory: true },
      location: { visible: true, compulsory: true },
      address: { visible: true, compulsory: true },
      occupation: { visible: true, compulsory: false },
      relationship: { visible: true, compulsory: true },
   }
}

export const africanCountries = {
   "Algeria": { region: "North Africa" },
   "Angola": { region: "Central Africa" },
   "Benin": { region: "West Africa" },
   "Botswana": { region: "Southern Africa" },
   "Burkina Faso": { region: "West Africa" },
   "Burundi": { region: "East Africa" },
   "Cabo Verde": { region: "West Africa" },
   "Cameroon": { region: "Central Africa" },
   "Central African Republic": { region: "Central Africa" },
   "Chad": { region: "Central Africa" },
   "Comoros": { region: "East Africa" },
   "Congo (Congo-Brazzaville)": { region: "Central Africa" },
   "Congo (Congo-Kinshasa)": { region: "Central Africa" },
   "Djibouti": { region: "East Africa" },
   "Egypt": { region: "North Africa" },
   "Equatorial Guinea": { region: "Central Africa" },
   "Eritrea": { region: "East Africa" },
   "Eswatini ": { region: "Southern Africa" },
   "Ethiopia": { region: "East Africa" },
   "Gabon": { region: "Central Africa" },
   "Gambia": { region: "West Africa" },
   "Ghana": { region: "West Africa" },
   "Guinea": { region: "West Africa" },
   "Guinea-Bissau": { region: "West Africa" },
   "Ivory Coast": { region: "West Africa" },
   "Kenya": { region: "East Africa" },
   "Lesotho": { region: "Southern Africa" },
   "Liberia": { region: "West Africa" },
   "Libya": { region: "North Africa" },
   "Madagascar": { region: "East Africa" },
   "Malawi": { region: "East Africa" },
   "Mali": { region: "West Africa" },
   "Mauritania": { region: "West Africa" },
   "Mauritius": { region: "East Africa" },
   "Morocco": { region: "North Africa" },
   "Mozambique": { region: "East Africa" },
   "Namibia": { region: "Southern Africa" },
   "Niger": { region: "West Africa" },
   "Nigeria": { region: "West Africa" },
   "Rwanda": { region: "East Africa" },
   "Sao Tome and Principe": { region: "Central Africa" },
   "Senegal": { region: "West Africa" },
   "Seychelles": { region: "East Africa" },
   "Sierra Leone": { region: "West Africa" },
   "Somalia": { region: "East Africa" },
   "South Africa": { region: "Southern Africa" },
   "South Sudan": { region: "East Africa" },
   "Sudan": { region: "North Africa" },
   "Togo": { region: "West Africa" },
   "Tanzania": { region: "East Africa" },
   "Tunisia": { region: "North Africa" },
   "Uganda": { region: "East Africa" },
   "Zambia": { region: "East Africa" },
   "Zimbabwe": { region: "Southern Africa" }
};


export const ghanaDistricts = {
   "Greater Accra Region": {
      ACC: { name: "Accra Metropolitan" },
      ADE: { name: "Ada East" },
      ADW: { name: "Ada West" },
      ASH: { name: "Ashaiman" },
      DAE: { name: "Dangme East" },
      DAW: { name: "Dangme West" },
      GAC: { name: "Ga Central" },
      GAE: { name: "Ga East" },
      GAN: { name: "Ga North" },
      GAS: { name: "Ga South" },
      KOR: { name: "Korle-Klottey" },
      LED: { name: "Ledzokuku-Krowor" },
      TEM: { name: "Tema Metropolitan" },
      TEW: { name: "Tema West" },
      TEE: { name: "Tema East" }
   },
   "Ashanti Region": {
      ADN: { name: "Adansi North" },
      ADS: { name: "Adansi South" },
      AFK: { name: "Afigya Kwabre" },
      AFS: { name: "Afigya Sekyere" },
      AHN: { name: "Ahafo Ano North" },
      AHS: { name: "Ahafo Ano South" },
      AHA: { name: "Ahafo Region" },
      AMC: { name: "Amansie Central" },
      AME: { name: "Amansie East" },
      AMS: { name: "Amansie South" },
      ATK: { name: "Atwima Kwanwoma" },
      ATM: { name: "Atwima Mponua" },
      ATN: { name: "Atwima Nwabiagya" },
      BAN: { name: "Bantama" },
      BEK: { name: "Bekwai" },
      KWE: { name: "Kwabre East" },
      KUM: { name: "Kumasi Metropolitan" },
      OBE: { name: "Obuasi East" },
      OBW: { name: "Obuasi West" },
      SEC: { name: "Sekyere Central" },
      SEE: { name: "Sekyere East" },
      SES: { name: "Sekyere South" },
      SUA: { name: "Suame" },
      TAFO: { name: "Tafo" },
      ASM: { name: "Asokore Mampong" }
   },
   "Western Region": {
      AHW: { name: "Ahanta West" },
      AMC: { name: "Amenfi Central" },
      AME: { name: "Amenfi East" },
      AMW: { name: "Amenfi West" },
      BAB: { name: "Bibiani-Anhwiaso-Bekwai" },
      BIAE: { name: "Bia East" },
      BIAW: { name: "Bia West" },
      JOM: { name: "Jomoro" },
      MPO: { name: "Mpohor" },
      PRE: { name: "Prestea-Huni Valley" },
      SHA: { name: "Shama" },
      SEF: { name: "Sefwi Akontombra" },
      SEB: { name: "Sefwi Bekwai" },
      SEBOD: { name: "Sefwi Bodi" },
      SEJ: { name: "Sefwi Juaboso" },
      SEW: { name: "Sefwi Wiawso" }
   },
   "Western North Region": {
      AOW: { name: "Aowin" },
      BAB: { name: "Bibiani-Anhwiaso-Bekwai" },
      BOD: { name: "Bodi" },
      SEF: { name: "Sefwi Akontombra" },
      SEB: { name: "Sefwi Bekwai" },
      SEBOD: { name: "Sefwi Bodi" },
      SEJ: { name: "Sefwi Juaboso" },
      SEW: { name: "Sefwi Wiawso" }
   },
   "Northern Region": {
      BUN: { name: "Bunkpurugu/Nakpanduri" },
      CEG: { name: "Central Gonja" },
      EGA: { name: "East Gonja" },
      EMA: { name: "East Mamprusi" },
      KAR: { name: "Karaga" },
      KPA: { name: "Kpandai" },
      MIO: { name: "Mion" },
      NAN: { name: "Nanumba North" },
      NAS: { name: "Nanumba South" },
      SAB: { name: "Saboba" },
      SAG: { name: "Sagnarigu" },
      WEG: { name: "West Gonja" },
      WMU: { name: "West Mamprusi" },
      YEN: { name: "Yendi" }
   },
   "Upper East Region": {
      BAW: { name: "Bawku Central" },
      BAO: { name: "Bawku West" },
      BOL: { name: "Bolgatanga Municipal" },
      BOE: { name: "Bolgatanga East" },
      BNG: { name: "Bongo" },
      KAN: { name: "Kassena-Nankana Municipal" },
      KANW: { name: "Kassena-Nankana West" },
      NAB: { name: "Nabdam" },
      TAL: { name: "Talensi" },
      ZEB: { name: "Zebilla" }
   },
   "Upper West Region": {
      DAB: { name: "Daffiama Bussie Issa" },
      LAW: { name: "Lawra" },
      NAN: { name: "Nandom" },
      WAE: { name: "Wa East" },
      WAM: { name: "Wa Municipal" },
      WAW: { name: "Wa West" },
      JIR: { name: "Jirapa" },
      SIE: { name: "Sissala East" },
      SIW: { name: "Sissala West" }
   },
   "Central Region": {
      ABA: { name: "Abura/Asebu/Kwamankese" },
      AGE: { name: "Agona East" },
      AGW: { name: "Agona West" },
      ASS: { name: "Assin Central" },
      ASW: { name: "Assin West" },
      CEK: { name: "Cape Coast Metropolitan" },
      KEE: { name: "Komenda/Edina/Eguafo/Abirem" },
      MFR: { name: "Mfantsiman" },
      TWY: { name: "Twifo Atti Mokwa" }
   },
   "Eastern Region": {
      AKY: { name: "Akyemansa" },
      BIB: { name: "Birim Central" },
      BIN: { name: "Birim North" },
      BIS: { name: "Birim South" },
      EMA: { name: "East Akim" },
      FRI: { name: "Fanteakwa North" },
      FIE: { name: "Fanteakwa South" },
      KWA: { name: "Kwahu Afram Plains North" },
      KWE: { name: "Kwahu Afram Plains South" },
      KWO: { name: "Kwahu East" },
      KWN: { name: "Kwahu North" },
      KWS: { name: "Kwahu South" },
      MAM: { name: "Manya Krobo" },
      NLA: { name: "New Juaben North" },
      NLB: { name: "New Juaben South" },
      ODA: { name: "Odumase Krobo" },
      THA: { name: "Thyolo" }
   }
};


export const designation = ['Mr.', 'Mrs.', 'Miss', 'Ms.', 'Dr.', 'Prof.', 'Alhaji', 'Alhaja', 'Chief', 'Lady', 'Rev.', 'Fr.', 'Pastor', 'Imam', 'Sheikh', 'Sultan', 'Nana', 'Oba', 'Oga', 'Madam', 'Other'];








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
      // if (setState) setState(registration);
      if (toast) { toast.error("something wrong occured", { autoClose: 2000 }) }
   }
}




export interface RegistrationFields {
   firstname: string;
   middlename: string;
   lastname: string;
   designation: string;
   age: string;
   ageType: string;
   gender: string;
   mobileCountryCode: string;
   whatsappCountryCode: string;
   relativecontactnumber: string;
   relativeCountryCode: string;
   whatAppcontact: string;
   email: string;
   marital_status: string;
   mobile_number: string;
   contact_pointer: string;
   years: string;
   registeredby: string | number;
   months: string;
   days: string;
};


export const PatientPersonalInformationFields: RegistrationFields = {
   firstname: "",
   middlename: "",
   lastname: "",
   designation: "",
   age: "",
   ageType: "years",
   gender: "",
   mobile_number: "",
   mobileCountryCode: "+233",
   whatsappCountryCode: "+233",
   relativecontactnumber: "",
   registeredby: "",
   relativeCountryCode: "+233",
   whatAppcontact: "",
   email: "",
   marital_status: "",
   contact_pointer: "self",
   years: "",
   months: "",
   days: "",
};