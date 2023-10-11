import React from 'react';
import Link from 'next/link';
import { MonetizationOn } from '@mui/icons-material';

export default function Index() {
  return (
    <div id='frontpagewrapper'>
      <h1 className='text-center'>{new Date().toDateString()}</h1>
      <h3 className='text-center'>Apps</h3>
      <ul>
        <Link href="/registration">
          Registration & Billing
        </Link>
        <Link href="/operations/laboratory">
          Laboratory
        </Link>
        <Link href="/operations/imaging/ultrasound">
          Imaging
        </Link>
        <Link href="/inventory">
          Inventory
        </Link>
        <Link href="/">
          Supplies
        </Link>
        <Link href="/settings/emailsetting">
          Email Management
        </Link>
        <Link href="/settings/sms">
          SMS Management
        </Link>
        <Link href="/instructions">
          Instructions
        </Link>
      </ul>
    </div>
  );
}
