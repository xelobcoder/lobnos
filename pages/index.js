import React from 'react'
import Link from 'next/link'
export default function Index() {
  return (
    <div id='frontpagewrapper'>
      <h1 className='text-center'>{new Date().toDateString()}</h1>
      <h3 className='text-center'>Apps</h3>
      <ul id='frontpagecards'>
        <Link href="/registration">registration and bilLinkng</Link>
        <Link href="/operations/laboratory">laboratory</Link>
        <Link href="/operations/imaging/ultrasound">Imaging</Link>
        <Link href="/">Inventory</Link>
        <Link href="/">suppLinkes</Link>
        <Link href="/settings/emailsetting">EmaiLinkng system</Link>
        <Link href="/">Sms management</Link>
        <Link href="/">instructions </Link>
      </ul>
    </div>
  )
}

