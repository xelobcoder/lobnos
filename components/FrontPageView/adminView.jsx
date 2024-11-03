import React from 'react';
import Link from 'next/link';
import {
  Analytics, AppRegistration, Approval, AppsOutlined,
  Bloodtype, Dashboard, Draw, EmailOutlined, ExploreOff, ImagesearchRoller,
  IntegrationInstructions, Inventory, Person2, ReceiptLongSharp, TrackChanges
} from '@mui/icons-material';

const links = [
  { href: '/registration', icon: <AppRegistration sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Registration & Billing' },
  { href: '/operations/laboratory', icon: <Bloodtype sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Laboratory Operations' },
  { href: '/operations/imaging/ultrasound', icon: <ImagesearchRoller sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Medical Imaging' },
  { href: '/phelobotomy', icon: <Draw sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Phelobotomy' },
  { href: '/administration/approval', icon: <Approval sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Result Approval' },
  { href: '/dashboard', icon: <Dashboard sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Dashboard' },
  { href: '/authentication/users', icon: <Person2 sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Users' },
  { href: '/settings/applicationsettings', icon: <AppsOutlined sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Application Settings' },
  { href: '/expense/expenseslist', icon: <ExploreOff sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Expenses', disabled: true },
  { href: '/upgrade', icon: <Inventory sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Inventory Management', disabled: true },
  { href: '/supplier', icon: <ReceiptLongSharp sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Purchase Management' },
  { href: '/resultanalysis', icon: <Analytics sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Result Analysis' },
  { href: '/email', icon: <EmailOutlined sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Email Services' },
  { href: '/doctor', icon: <TrackChanges sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: "Doctor's Portal" },
  { href: '/clients', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M14 21C13.4477 21 13 20.5523 13 20V12C13 11.4477 13.4477 11 14 11H20C20.5523 11 21 11.4477 21 12V20C21 20.5523 20.5523 21 20 21H14ZM4 13C3.44772 13 3 12.5523 3 12V4C3 3.44772 3 4 4 4H10C10.5523 4 11 4.44772 11 4V12C11 12.5523 10.5523 13 10 13H4ZM9 11V5H5V11H9ZM4 21C3.44772 21 3 20.5523 3 20V16C3 15.4477 3.44772 15 4 15H10C10.5523 15 11 15.4477 11 16V20C11 20.5523 10.5523 21 10 21H4ZM5 19H9V17H5V19ZM15 19H19V13H15V19ZM13 4C13 3.44772 13.4477 3 14 3H20C20.5523 3 21 3.44772 21 4V8C21 8.55228 20.5523 9 20 9H14C13.4477 9 13 8.55228 13 8V4ZM15 5V7H19V5H15Z"></path></svg>, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: "Patient's Portal" },
  { href: '/instructions', icon: <IntegrationInstructions sx={{ height: 50, color: 'white', width: 50, color: 'white', marginBottom: '8px' }} />, text: "An adjustable rectangular diaphragm is used to collimate the radiation field to the size of the lung fields. ", label: 'Instructions' }
];

export default function FrontPageAdminView() {
  return (
    <div>
      <div className='front-page-ui-presentation bg-secondary-subtle p-3'>
        {links.map((link, index) => (
          <div key={index} className='_pre_app'>
            <div className=' justify-content-center d-flex icon'>
              <span>
                {link.icon}
              </span>
            </div>
            <div className=' justify-content-center d-flex'>
              <span>{link.label}</span>
              <span>{link.text}</span>
            </div>
            <div>
              <button className='btn btn-light btn-sm'>
                <Link href={link.href}>
                  visit
                </Link>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
