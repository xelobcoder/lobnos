import { Avatar } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

export default function SupllierProfile({ datasource }) {
 const [supplier, setSupplier] = React.useState(datasource);

 return (
  <>
   <div className='supply-profile-wrapper'>
    <div className='supply-image'>
     <Image src='/../public/male-profile-pic.jpeg' alt='edta tubes' width={500} height={500} />
    </div>
    <div className='supply-addtional-info'>
     <p>Supply Name: {supplier.NAME || ''}</p>
     <p>Address : {supplier.ADDRESS || 'kalpohin lowcost 30 A'}</p>
     <p>Phone Number: {supplier.PHONE || '0595964565'} </p>
     <p>Email: 

      <Link href={`/mail/supplier/${supplier.EMAIL}`}>
      <a>{supplier.EMAIL || '  hamzatiifu45@gmail.com'}</a>
     </Link> </p>
    </div>
   </div>
  </>
 )
}
