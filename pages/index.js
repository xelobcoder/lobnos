import React from 'react';
import Link from 'next/link';
import { useContext } from 'react';
import AuthContext from '../components/Auth/useAuthentification';

export default function Index() {
  const { auth } = useContext(AuthContext);
  const { username } = auth;

  return (
    <div id='frontpagewrapper'>
      <h1 className='text-center text-success'>{username || ''}</h1>
      <h1 className='text-center'>{new Date().toDateString()}</h1>
      <h3 className='text-center'>Apps</h3>
      <ul style={{display:'grid',gridTemplateColumns:'30% 30% 30%', gridGap:'20px'}}>
        <Link className='bg-primary p-4  text-white text-center' href="/registration">
          Registration & Billing
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/operations/laboratory">
          Laboratory
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/operations/imaging/ultrasound">
          Imaging
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/inventory">
          Inventory
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/">
          Supplies
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/settings/emailsetting">
          Email Management
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/settings/sms">
          SMS Management
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/instructions">
          Instructions
        </Link>
      </ul>
    </div>
  );
}
