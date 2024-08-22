import {
   AssignmentInd,
   VerifiedUser,
   MonetizationOn,
   Event,
   Business,
   SupervisorAccount,
   ViewArray,
   ShoppingBagRounded
 } from '@mui/icons-material';
import AppCustomLayout from './CustomLayout';
 
export default function FrontDeskLayout({children}) {
   const sideLinks = [
     { title: "registration", link: "/registration", icon: <AssignmentInd /> },
     { title: "customers", link: "/customers", icon: <VerifiedUser /> },
     { title: "customers vital sign", link: "/customers/recordVitalSigns", icon: <VerifiedUser /> },
     { title: "billing", link: "/billing/payment", icon: <MonetizationOn /> },
     {
       title: "sales",
       link: "/billing/salessummary",
       icon: <MonetizationOn />,
       subLinks: [
         { title: "Day summary", link: "/billing/salessummary/daily", icon: <MonetizationOn /> },
         { title: "sales summary", link: "/billing/salessummary", icon: <MonetizationOn /> }
       ],
     },
     { title: 'test price list', link: '/pricelist', icon: <ShoppingBagRounded /> },
     // { title: 'Clients', link: '/patients', icon: <Person /> },
     { title: 'Appointments', link: '/appointments', icon: <Event /> },
     { title: "Organization", link: "/organization", icon: <Business /> },
     { title: "Clinicians", link: "/clinician", icon: <SupervisorAccount /> },
     { title: "Result", link: "/registration/ready", icon: <ViewArray /> },
   ]
   return (
      <AppCustomLayout sideLinks={sideLinks} defaultscreen={false}>
         {children}
      </AppCustomLayout>
   )
}