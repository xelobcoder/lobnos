import React from 'react'
import Link from 'next/link'
import { Bloodtype } from '@mui/icons-material'
import Image from 'next/image'
export default function Index() {
  return (
    <div id='frontpagewrapper'>
      <h1 className='text-center'>{new Date().toDateString()}</h1>
      <h3 className='text-center'>Apps</h3>
      <ul id='frontpagecards'>
        <Link href="/registration" >
          <div >
            <span className='image'>
              <Image height={'100'} width={'100'} alt='registration and billing image' src={'/asserts/billing.jpg'} />
            </span>
            <div className='text'>
              <h4>registration && billing</h4>
            </div>
          </div>
        </Link>
        <Link href="/operations/laboratory">
          <div>
            <span className='image'>
              <Image height={100} width={100} alt='laboratory section' src={'/asserts/lab.jpg'} />
            </span>
            <div className='text'>
              <h4>laboratory</h4>
            </div>
          </div>
        </Link>
        <Link href="/operations/imaging/ultrasound">
          <div>
            <div className='image'>
              <Image src={'/asserts/radiograph.jpg'} height={100} width={100} alt='imageing section' />
            </div>
            <div className='text'>
              <h4> Imaging</h4>
            </div>
          </div>
        </Link>
        <Link href="/inventory">
          <div>
            <div className='image'>
              <Image height={100} width={100} alt='inventory app' src={'/asserts/inventroy.jpg'} />
            </div>
            <div className='text'>
              <h4>Inventory</h4>
            </div>
          </div>
        </Link>
        <Link href="/">suppLinkes</Link>
        <Link href="/settings/emailsetting">
          <div>
            <div className='image'>
              <Image src={'/asserts/email.jpg'} height={100} width={100} alt='email section' />
            </div>
            <div className='text'>
              <h4>EmaiL management</h4>
            </div>
          </div>
        </Link>
        <Link href="/settings/sms">
          <div>
            <div className='image'>
              <Image src={'/asserts/sms.jpg'} alt='sms settings' height={100} width={100} />
            </div>
            <div className='text'>
              <h4>Sms management</h4>
            </div>
          </div>
        </Link>
        <Link href="/instructions">instructions </Link>
      </ul>
    </div>
  )
}

