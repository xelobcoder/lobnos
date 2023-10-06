import React, { useState } from 'react';
import Link from 'next/link';
import {
  AssignmentInd,
  VerifiedUser,
  MonetizationOn,
  Person,
  Schedule,
  Poll,
  Event,
  Business,
  SupervisorAccount,
  Assessment,
  Science,
  LocalHospital,
  Settings,
  BusinessCenter,
  Work,
  Forward,
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
              <Link href="/activation" title='activation'>
                <div> <VerifiedUser /></div>
                <div> Activation</div>
              </Link>
            </li>
            <li>
              <Link href="/billing/billedclients">
                <div> <MonetizationOn /></div>
                <div>Billed Clients</div>
              </Link>
            </li>
            <li>
              <Link href="/patients">
                <div> <Person /></div>
                <div>Clients</div>
              </Link>
            </li>
            <li>
              <Link href="/appointments">
                <div>
                  <Event />
                </div>
                <div>Appointments</div>
              </Link>
            </li>
            <li>
              <Link href="/organization">
                <div> <Business /> </div>
                <div>Organization</div>
              </Link>
            </li>
            <li>
              <Link href="/clinicians">
                <SupervisorAccount /> Clinicians
              </Link>
            </li>
            <li>
              <Link href="/sample">
                <Science /> Sample
              </Link>
            </li>
            <li>
              <Link href="/phlebotomy">
                <LocalHospital /> Phlebotomy
              </Link>
            </li>
            <li>
              <Link href="/settings">
                <Settings /> Settings
              </Link>
            </li>
            <li>
              <Link href="/suppliers">
                <BusinessCenter /> Suppliers
              </Link>
            </li>
            <li>
              <Link href="/operations">
                <Work /> Operations
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
