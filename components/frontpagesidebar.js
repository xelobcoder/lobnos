import React from 'react';
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
} from '@mui/icons-material';

export default function SidebarFrontPage() {
  return (
    <>
      <ul className="frontpagesidebar">
        <li>
          <Link href="/registration">
            <AssignmentInd /> Registration
          </Link>
        </li>
        <li>
          <Link href="/activation">
            <VerifiedUser /> Activation
          </Link>
        </li>
        <li>
          <Link href="/billed-clients">
            <MonetizationOn /> Billed Clients
          </Link>
        </li>
        <li>
          <Link href="/clients">
            <Person /> Clients
          </Link>
        </li>
        <li>
          <Link href="/waiting-list">
            <Schedule /> Waiting List
          </Link>
        </li>
        <li>
          <Link href="/results">
            <Poll /> Results
          </Link>
        </li>
        <li>
          <Link href="/appointments">
            <Event /> Appointments
          </Link>
        </li>
        <li>
          <Link href="/organization">
            <Business /> Organization
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
