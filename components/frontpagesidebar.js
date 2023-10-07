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
                <Link href="/billing/billedclients">
                  <div>Billed Clients</div>
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <LocalHospital />
              </div>
              <div className='text'>
                <Link href="/phlebotomy">
                  Phlebotomy
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <Science />
              </div>
              <div className='text'>
                <Link href="/sample">
                  Sample
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <Work />
              </div>
              <div className='text'>
                <Link href="/operations">
                  Operations
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <Settings />
              </div>
              <div className='text'>
                <Link href="/settings">
                  Settings
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
                  <div>Organization</div>
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <SupervisorAccount />
              </div>
              <div className='text'>
                <Link href="/clinicians">
                  Clinicians
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <BusinessCenter />
              </div>
              <div className='text'>
                <Link href="/suppliers">
                  Suppliers
                </Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
