import { customFetch } from "../../Auth/customFetch"

export const registrationFields = {
   personalInformation: {
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
      area: { visible: true, compulsory: true },
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
   "Algeria": { code: "DZ", region: "North Africa" },
   "Angola": { code: "AO", region: "Central Africa" },
   "Benin": { code: "BJ", region: "West Africa" },
   "Botswana": { code: "BW", region: "Southern Africa" },
   "Burkina Faso": { code: "BF", region: "West Africa" },
   "Burundi": { code: "BI", region: "East Africa" },
   "Cabo Verde": { code: "CV", region: "West Africa" },
   "Cameroon": { code: "CM", region: "Central Africa" },
   "Central African Republic": { code: "CF", region: "Central Africa" },
   "Chad": { code: "TD", region: "Central Africa" },
   "Comoros": { code: "KM", region: "East Africa" },
   "Congo (Congo-Brazzaville)": { code: "CG", region: "Central Africa" },
   "Congo (Congo-Kinshasa)": { code: "CD", region: "Central Africa" },
   "Djibouti": { code: "DJ", region: "East Africa" },
   "Egypt": { code: "EG", region: "North Africa" },
   "Equatorial Guinea": { code: "GQ", region: "Central Africa" },
   "Eritrea": { code: "ER", region: "East Africa" },
   "Eswatini ": { code: "SZ", region: "Southern Africa" },
   "Ethiopia": { code: "ET", region: "East Africa" },
   "Gabon": { code: "GAB", region: "Central Africa" },
   "Gambia": { code: "GM", region: "West Africa" },
   "Ghana": { code: "GH", region: "West Africa" },
   "Guinea": { code: "GN", region: "West Africa" },
   "Guinea-Bissau": { code: "GW", region: "West Africa" },
   "Ivory Coast": { code: "CI", region: "West Africa" },
   "Kenya": { code: "KE", region: "East Africa" },
   "Lesotho": { code: "LS", region: "Southern Africa" },
   "Liberia": { code: "LR", region: "West Africa" },
   "Libya": { code: "LY", region: "North Africa" },
   "Madagascar": { code: "MG", region: "East Africa" },
   "Malawi": { code: "MW", region: "East Africa" },
   "Mali": { code: "ML", region: "West Africa" },
   "Mauritania": { code: "MR", region: "West Africa" },
   "Mauritius": { code: "MU", region: "East Africa" },
   "Morocco": { code: "MA", region: "North Africa" },
   "Mozambique": { code: "MZ", region: "East Africa" },
   "Namibia": { code: "NA", region: "Southern Africa" },
   "Niger": { code: "NE", region: "West Africa" },
   "Nigeria": { code: "NG", region: "West Africa" },
   "Rwanda": { code: "RW", region: "East Africa" },
   "Sao Tome and Principe": { code: "ST", region: "Central Africa" },
   "Senegal": { code: "SN", region: "West Africa" },
   "Seychelles": { code: "SC", region: "East Africa" },
   "Sierra Leone": { code: "SL", region: "West Africa" },
   "Somalia": { code: "SO", region: "East Africa" },
   "South Africa": { code: "ZA", region: "Southern Africa" },
   "South Sudan": { code: "SS", region: "East Africa" },
   "Sudan": { code: "SD", region: "North Africa" },
   "Togo": { code: "TG", region: "West Africa" },
   "Tanzania": { code: "TZ", region: "East Africa" },
   "Tunisia": { code: "TN", region: "North Africa" },
   "Uganda": { code: "UG", region: "East Africa" },
   "Zambia": { code: "ZM", region: "East Africa" },
   "Zimbabwe": { code: "ZW", region: "Southern Africa" }
};


export const ghanaDistricts = {
   "Greater Accra Region": {
      ACC: { name: "Accra Metropolitan", code: "ACC" },
      ADE: { name: "Ada East", code: "ADE" },
      ADW: { name: "Ada West", code: "ADW" },
      ASH: { name: "Ashaiman", code: "ASH" },
      DAE: { name: "Dangme East", code: "DAE" },
      DAW: { name: "Dangme West", code: "DAW" },
      GAC: { name: "Ga Central", code: "GAC" },
      GAE: { name: "Ga East", code: "GAE" },
      GAN: { name: "Ga North", code: "GAN" },
      GAS: { name: "Ga South", code: "GAS" },
      KOR: { name: "Korle-Klottey", code: "KOR" },
      LED: { name: "Ledzokuku-Krowor", code: "LED" },
      TEM: { name: "Tema Metropolitan", code: "TEM" },
      TEW: { name: "Tema West", code: "TEW" },
      TEE: { name: "Tema East", code: "TEE" }
   },
   "Ashanti Region": {
      ADN: { name: "Adansi North", code: "ADN" },
      ADS: { name: "Adansi South", code: "ADS" },
      AFK: { name: "Afigya Kwabre", code: "AFK" },
      AFS: { name: "Afigya Sekyere", code: "AFS" },
      AHN: { name: "Ahafo Ano North", code: "AHN" },
      AHS: { name: "Ahafo Ano South", code: "AHS" },
      AHA: { name: "Ahafo Region", code: "AHA" },
      AMC: { name: "Amansie Central", code: "AMC" },
      AME: { name: "Amansie East", code: "AME" },
      AMS: { name: "Amansie South", code: "AMS" },
      ATK: { name: "Atwima Kwanwoma", code: "ATK" },
      ATM: { name: "Atwima Mponua", code: "ATM" },
      ATN: { name: "Atwima Nwabiagya", code: "ATN" },
      BAN: { name: "Bantama", code: "BAN" },
      BEK: { name: "Bekwai", code: "BEK" },
      KWE: { name: "Kwabre East", code: "KWE" },
      KUM: { name: "Kumasi Metropolitan", code: "KUM" },
      OBE: { name: "Obuasi East", code: "OBE" },
      OBW: { name: "Obuasi West", code: "OBW" },
      SEC: { name: "Sekyere Central", code: "SEC" },
      SEE: { name: "Sekyere East", code: "SEE" },
      SES: { name: "Sekyere South", code: "SES" },
      SUA: { name: "Suame", code: "SUA" },
      TAFO: { name: "Tafo", code: "TAFO" },
      ASM: { name: "Asokore Mampong", code: "ASM" }
   },
   "Western Region": {
      AHW: { name: "Ahanta West", code: "AHW" },
      AMC: { name: "Amenfi Central", code: "AMC" },
      AME: { name: "Amenfi East", code: "AME" },
      AMW: { name: "Amenfi West", code: "AMW" },
      BAB: { name: "Bibiani-Anhwiaso-Bekwai", code: "BAB" },
      BIAE: { name: "Bia East", code: "BIAE" },
      BIAW: { name: "Bia West", code: "BIAW" },
      JOM: { name: "Jomoro", code: "JOM" },
      MPO: { name: "Mpohor", code: "MPO" },
      PRE: { name: "Prestea-Huni Valley", code: "PRE" },
      SHA: { name: "Shama", code: "SHA" },
      SEF: { name: "Sefwi Akontombra", code: "SEF" },
      SEB: { name: "Sefwi Bekwai", code: "SEB" },
      SEB: { name: "Sefwi Bodi", code: "SEB" },
      SEJ: { name: "Sefwi Juaboso", code: "SEJ" },
      SEW: { name: "Sefwi Wiawso", code: "SEW" },
      WEN: { name: "Western North Region", code: "WEN" }
   },
   "Western North Region": {
      AOW: { name: "Aowin", code: "AOW" },
      BAB: { name: "Bibiani-Anhwiaso-Bekwai", code: "BAB" },
      BOD: { name: "Bodi", code: "BOD" },
      SEF: { name: "Sefwi Akontombra", code: "SEF" },
      SEB: { name: "Sefwi Bekwai", code: "SEB" },
      SEB: { name: "Sefwi Bodi", code: "SEB" },
      SEJ: { name: "Sefwi Juaboso", code: "SEJ" },
      SEW: { name: "Sefwi Wiawso", code: "SEW" }
   },
   "Northern Region": {
      BUN: { name: "Bunkpurugu/Nakpanduri", code: "BUN" },
      CEG: { name: "Central Gonja", code: "CEG" },
      EGA: { name: "East Gonja", code: "EGA" },
      EMA: { name: "East Mamprusi", code: "EMA" },
      KAR: { name: "Karaga", code: "KAR" },
      KPA: { name: "Kpandai", code: "KPA" },
      MIO: { name: "Mion", code: "MIO" },
      NAN: { name: "Nanumba North", code: "NAN" },
      NAS: { name: "Nanumba South", code: "NAS" },
      SAB: { name: "Saboba", code: "SAB" },
      SAG: { name: "Sagnarigu", code: "SAG" },
      WEG: { name: "West Gonja", code: "WEG" },
      WMU: { name: "West Mamprusi", code: "WMU" },
      YEN: { name: "Yendi", code: "YEN" }
   },
   "Upper East Region": {
      BAW: { name: "Bawku Central", code: "BAW" },
      BAO: { name: "Bawku West", code: "BAO" },
      BOL: { name: "Bolgatanga Municipal", code: "BOL" },
      BOE: { name: "Bolgatanga East", code: "BOE" },
      BNG: { name: "Bongo", code: "BNG" },
      KAN: { name: "Kassena-Nankana Municipal", code: "KAN" },
      KAN: { name: "Kassena-Nankana West", code: "KAN" },
      NAB: { name: "Nabdam", code: "NAB" },
      TAL: { name: "Talensi", code: "TAL" },
      ZEB: { name: "Zebilla", code: "ZEB" }
   },
   "Upper West Region": {
      DAB: { name: "Daffiama Bussie Issa", code: "DAB" },
      LAW: { name: "Lawra", code: "LAW" },
      NAN: { name: "Nandom", code: "NAN" },
      WAE: { name: "Wa East", code: "WAE" },
      WAM: { name: "Wa Municipal", code: "WAM" },
      WAW: { name: "Wa West", code: "WAW" },
      JIR: { name: "Jirapa", code: "JIR" },
      SIE: { name: "Sissala East", code: "SIE" },
      SIW: { name: "Sissala West", code: "SIW" }
   },
   "Central Region": {
      ABA: { name: "Abura/Asebu/Kwamankese", code: "ABA" },
      AGE: { name: "Agona East", code: "AGE" },
      AGW: { name: "Agona West", code: "AGW" },
      ASS: { name: "Assin Central", code: "ASS" },
      ASW: { name: "Assin West", code: "ASW" },
      CEK: { name: "Cape Coast Metropolitan", code: "CEK" },
      KEE: { name: "Komenda/Edina/Eguafo/Abirem", code: "KEE" },
      MFR: { name: "Mfantsiman", code: "MFR" },
      TWY: { name: "Twifo Atti Mokwa", code: "TWY" }
   },
   "Eastern Region": {
      AKY: { name: "Akyemansa", code: "AKY" },
      BIB: { name: "Birim Central", code: "BIB" },
      BIA: { name: "Birim North", code: "BIA" },
      BIB: { name: "Birim South", code: "BIB" },
      EMA: { name: "East Akim", code: "EMA" },
      FRI: { name: "Fanteakwa North", code: "FRI" },
      FIE: { name: "Fanteakwa South", code: "FIE" },
      KWA: { name: "Kwahu Afram Plains North", code: "KWA" },
      KWE: { name: "Kwahu Afram Plains South", code: "KWE" },
      KWO: { name: "Kwahu East", code: "KWO" },
      KWN: { name: "Kwahu North", code: "KWN" },
      KWS: { name: "Kwahu South", code: "KWS" },
      MAM: { name: "Manya Krobo", code: "MAM" },
      NLA: { name: "New Juaben North", code: "NLA" },
      NLB: { name: "New Juaben South", code: "NLB" },
      ODA: { name: "Odumase Krobo", code: "ODA" },
      THA: { name: "Thyolo", code: "THA" }
   },
   "Western North Region": {
      AOW: { name: "Aowin", code: "AOW" },
      BAB: { name: "Bibiani-Anhwiaso-Bekwai", code: "BAB" },
      BOD: { name: "Bodi", code: "BOD" },
      SEF: { name: "Sefwi Akontombra", code: "SEF" },
      SEB: { name: "Sefwi Bekwai", code: "SEB" },
      SEB: { name: "Sefwi Bodi", code: "SEB" },
      SEJ: { name: "Sefwi Juaboso", code: "SEJ" },
      SEW: { name: "Sefwi Wiawso", code: "SEW" }
   }
};




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