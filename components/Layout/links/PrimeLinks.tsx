import { plsEncryption } from "../../../lib/encryption";
import { RiBarChartLine, RiCustomerService2Line, RiMoneyDollarCircleLine, RiSettings3Line, RiStethoscopeLine, RiCalendarLine, RiUserHeartLine, RiHospitalLine, RiMailLine, RiFileListLine, RiMedicineBottleLine, RiExternalLinkLine } from '@remixicon/react';

interface Link {
  title: string, link: string, icon: React.ReactNode, subLinks?: Link[];
}

const Icon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM12.5 7C14.433 7 16 8.567 16 10.5C16 11.7668 15.327 12.8763 14.3191 13.4907L16.869 17H14.397L12.217 14H10V17H8V7H12.5ZM12.5 9H10V12H12.5C13.2797 12 13.9204 11.4051 13.9931 10.6445L14 10.5C14 9.67157 13.3284 9 12.5 9Z"></path>
    </svg>
);


// const sidebarLinks = [
//   { title: "Applications Settings", link: "/settings/applicationsettings", icon: <SettingsApplications /> },
//   { title: "Registration Fields", link: "/settings/applicationsettings/registrationFields", icon: <FileDownload/> },
//   { title: "Result Entry Settings", link: "/settings/applicationsettings/resultEntrySettings", icon: <ResetTvOutlined/> },
//   { title: "Users", link: "/authentication/users", icon: <VerifiedUser /> },
//   { title: "Branches", link: "/settings/branches", icon: <Forest /> },
//   { title: "sample types", link: "/settings/testpanel/sampletypes", icon: <Forest /> },
//   { title: "Company Info", link: "/settings/companyprofile", icon: <CorporateFareRounded /> },
//   { title: "Departments", link: "/settings/department", icon: <TripOrigin /> },
//   { title: "Taxes", link: "/settings/tax", icon: <Looks3Sharp /> },
//   { title: "Test Panels", link: "/settings/testpanel/testlist", icon: <TextSnippetRounded /> },
//   { title: "Services", link: "/settings/additionalservices", icon: <RoomServiceSharp/> },
//   {
//     title: "outsourcing", link: "/settings/outsource", icon: <Outbox />, subLinks: [
//       { title: 'New Organization', link: '/settings/outsource/newOutsourcing', icon: <OutboxSharp /> },
//       { title: 'Outsourcing List', link: '/settings/outsource', icon: <OutboxSharp /> }
//     ]
//   },
//   {
//     title: 'Drugs', link: '/settings/applicationsettings/drugs', icon: <MedicationRounded />, subLinks: [
//       { title: 'Drug Category', link: '/settings/applicationsettings/drugs/drugCategoryView' },
//       {
//         title: 'Drugs List', link: '/settings/applicationsettings/drugs', icon: <MedicationRounded />
//       }
//     ]
//   },
//   { title: "Email Management", link: "/settings/emailsetting", icon: <Sms /> },
// ];



// export const Mylinks = function (branchid: number,employeeid:number): Link[] {
//     const branchId = plsEncryption(branchid.toString());
//     return [
      
    
 
//         {
//             title: 'Analytics',
//             link: '/analytics',
//             icon: <RiBarChartLine />,
//             subLinks: [
              
//             ]
//         },
      
       
//         {
//             title: "Customers",
//             icon: <RiCustomerService2Line />,
//             link: "/customers",
//             subLinks: [{
//                 title: "Customers",
//                 link: "/customers",
//             }, {
//                 title: "Registration",
//                 link: "/registration"
//             },
//             { title: "Clinicians", link: "/clinician" },
//             { title: "Add New Clinician", link: "/clinician/new" },
//         ]
//         },
    
//         {
//             title: "Doctors Portal",
//             icon: <RiStethoscopeLine />,
//             link: "/doctor/consultation",
//             subLinks: [
//                 { title: 'Consulations', link: '/doctor/consultation/allconsultations' },
//                 { title: "Consult", link: '/doctor/consultation' },
//                 {
//                     title: 'Pending Consultations', link: "/doctor/consultation/clients/pending"
//                 }
//             ]
//         },
       
//         {
//             title: 'Settings',
//             icon: <RiSettings3Line />,
//             link: '/settings',
//             subLinks: [
                

//             ]
//         },
//     ];
// }


