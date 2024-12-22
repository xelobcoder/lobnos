import React from 'react';
import Link from 'next/link';
import {
  Analytics, AppRegistration, Approval, AppsOutlined,
  Bloodtype, Dashboard, Draw, EmailOutlined, ExploreOff, ImagesearchRoller,
  IntegrationInstructions, Inventory, Person2, ReceiptLongSharp, TrackChanges
} from '@mui/icons-material';

const links = [
  { href: '/registration', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM12.5 7C14.433 7 16 8.567 16 10.5C16 11.7668 15.327 12.8763 14.3191 13.4907L16.869 17H14.397L12.217 14H10V17H8V7H12.5ZM12.5 9H10V12H12.5C13.2797 12 13.9204 11.4051 13.9931 10.6445L14 10.5C14 9.67157 13.3284 9 12.5 9Z"></path></svg>, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Registration & Billing' },
  { href: '/operations/laboratory', icon: <img width={30} height={30} src='sampletubes.png' />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Laboratory Operations' },
  { href: '/operations/imaging/ultrasound', icon: <img width={30} height={30} src='/frontpage/ultrasoundmachine.png' />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Medical Imaging' },
  { href: '/phelobotomy', icon: <img width={30} height={30} src='/frontpage/sample.png' /> , text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Phelobotomy' },
  { href: '/administration/approval', icon: <img width={30} height={30} src='/frontpage/approved.png' />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Result Approval' },
  { href: '/dashboard/sales', icon: <img width={ 30} height={ 30} src='/frontpage/dashboard.png' />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Dashboard' },
  { href: '/authentication/users', icon: <img width={30} height={30} src='/frontpage/users.png' /> , text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Users' },
  { href: '/settings/applicationsettings', icon: <img width={30} height={30} src='/frontpage/settings.png' />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Application Settings' },
  { href: '/expense/expenseslist', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M3.00488 3.00275H21.0049C21.5572 3.00275 22.0049 3.45046 22.0049 4.00275V20.0027C22.0049 20.555 21.5572 21.0027 21.0049 21.0027H3.00488C2.4526 21.0027 2.00488 20.555 2.00488 20.0027V4.00275C2.00488 3.45046 2.4526 3.00275 3.00488 3.00275ZM4.00488 5.00275V19.0027H20.0049V5.00275H4.00488ZM8.50488 14.0027H14.0049C14.281 14.0027 14.5049 13.7789 14.5049 13.5027C14.5049 13.2266 14.281 13.0027 14.0049 13.0027H10.0049C8.62417 13.0027 7.50488 11.8835 7.50488 10.5027C7.50488 9.12203 8.62417 8.00275 10.0049 8.00275H11.0049V6.00275H13.0049V8.00275H15.5049V10.0027H10.0049C9.72874 10.0027 9.50488 10.2266 9.50488 10.5027C9.50488 10.7789 9.72874 11.0027 10.0049 11.0027H14.0049C15.3856 11.0027 16.5049 12.122 16.5049 13.5027C16.5049 14.8835 15.3856 16.0027 14.0049 16.0027H13.0049V18.0027H11.0049V16.0027H8.50488V14.0027Z"></path></svg>, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Expenses', disabled: true },
  // { href: '/upgrade', icon: <Inventory sx={{ height: 30, color: 'white', width: 30, marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Inventory Management', disabled: true },
  { href: '/supplier', icon: <ReceiptLongSharp sx={{ height: 30, color: 'white', width: 30, marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Purchase Management' },
  { href: '/dashboard/resultanalysis', icon: <Analytics sx={{ height: 30, color: 'white', width: 30, marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Result Analysis' },
  { href: '/email', icon: <EmailOutlined sx={{ height: 30, color: 'white', width: 30, marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Email Services' },
  { href: '/doctor/consultation', icon: <TrackChanges sx={{ height: 30, color: 'white', width: 30, marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: "Doctor's Portal" },
  { href: '/clients', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M14 21C13.4477 21 13 20.5523 13 20V12C13 11.4477 13.4477 11 14 11H20C20.5523 11 21 11.4477 21 12V20C21 20.5523 20.5523 21 20 21H14ZM4 13C3.44772 13 3 12.5523 3 12V4C3 3.44772 3 4 4 4H10C10.5523 4 11 4.44772 11 4V12C11 12.5523 10.5523 13 10 13H4ZM9 11V5H5V11H9ZM4 21C3.44772 21 3 20.5523 3 20V16C3 15.4477 3.44772 15 4 15H10C10.5523 15 11 15.4477 11 16V20C11 20.5523 10.5523 21 10 21H4ZM5 19H9V17H5V19ZM15 19H19V13H15V19ZM13 4C13 3.44772 13.4477 3 14 3H20C20.5523 3 21 3.44772 21 4V8C21 8.55228 20.5523 9 20 9H14C13.4477 9 13 8.55228 13 8V4ZM15 5V7H19V5H15Z"></path></svg>, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: "Patient's Portal" },
  { href: '/instructions', icon: <IntegrationInstructions sx={{ height: 30, color: 'white', width: 30, marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields.", label: 'Instructions' }
];

export default function FrontPageAdminView() {
  return (
    <div>
      <div className='front-page-ui-presentation bawlor p-3'>
        {links.map((link, index) => (
          <div key={index} className='_pre_app'>
            <div className='justify-content-center d-flex icon'>
              <span>
                {link.icon}
              </span>
            </div>
            <div className='text-pre'>
              <span>{link.label}</span>
              <span>{link.text}</span>
            </div>
            <div className='text-center pls-color p-3 d-flex justify-content-between'>
              <Link href='/' className='text-sm'>
                Read Doc
              </Link>
              <Link href={link.href}>
                Visit Site
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
