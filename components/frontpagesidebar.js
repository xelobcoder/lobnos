import React, { useState } from 'react';
import Link from 'next/link';
import {
  AssignmentInd,
  VerifiedUser,
  MonetizationOn,
  Person,
  Event,
  Business,
  SupervisorAccount,
  Science,
  LocalHospital,
  Settings,
  BusinessCenter,
  Work,
  Menu,
  ViewArray,
} from '@mui/icons-material';

export default function SidebarFrontPage() {
  return (
    <>
      <div className='settings-sidebar'>
        <div className='contents'>
          <ul>
            <li>
              <div className='icons'>
                <AssignmentInd />
              </div>
              <div className='text'>
                <Link title='registration' href="/registration" >
                  Registration
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <VerifiedUser />
              </div>
              <div className='text'>
                <Link href="/activation" title='activation'>
                  Activation
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <MonetizationOn />
              </div>
              <div className='text'>
                <Link href="/billing/payment">
                  Billing
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <MonetizationOn />
              </div>
              <div className='text'>
                <Link href="/billing/billedclients">
                  Billed Clients
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <Person />
              </div>
              <div className='text'>
                <Link href="/patients">
                  Clients
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <Event />
              </div>
              <div className='text'>
                <Link href="/appointments">
                  Appointments
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <Business />
              </div>
              <div className='text'>
                <Link href="/organization">
                  Organization
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <SupervisorAccount />
              </div>
              <div className='text'>
                <Link href="/clinician">
                  Clinicians
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <ViewArray/>
              </div>
              <div className='text'>
                <Link href="/registration/ready">
                  Result
                </Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
