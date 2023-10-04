import React from 'react'

export default function Index() {
  return (
    <div>
      <h1 className='text-center'>{new Date().toDateString()}</h1>
      <h3 className='text-center'>Apps</h3>
      <ul>
        <li>laboratory</li>
        <li>Imaging</li>
        <li>Inventory</li>
        <li>supplies</li>
        <li>Emailing system</li>
        <li>Sms management</li>
        <li>instructions </li>
      </ul>
      <h1 className='bg-warning alert alert-warning m-5 p-5'>
         Frontpageside
      </h1>
    </div>
  )
}

