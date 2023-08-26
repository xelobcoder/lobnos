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
      <ul className="frontpagesidebar">
        <li>
          <Link title='registration' href="/registration" >
            <div> <AssignmentInd /></div>
            <div> Registration</div>
          </Link>
        </li>
        <li>
          <Link href="/activation" title='activation'>
            <div> <VerifiedUser /></div>
            <div> Activation</div>
          </Link>
        </li>
        <li>
          <Link href="/billed-clients">
            <div> <MonetizationOn /></div>
            <div>Billed Clients</div>
          </Link>
        </li>
        <li>
          <Link href="/clients">
            <div> <Person /></div>
            <div>Clients</div>
          </Link>
        </li>
        <li>
          <Link href="/waiting-list">
            <div><Schedule /></div>
            <div> Waiting List</div>
          </Link>
        </li>
        <li>
          <Link href="/results">
            <div> <Poll /></div>
            <div>Results</div>
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
          <Link href="/testpanel">
            <Assessment /> Test Panel
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
    </>
  );
}
