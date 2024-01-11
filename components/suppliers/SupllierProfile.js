import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function SupllierProfile({ datasource }) {
 const [supplier, setSupplier] = useState(datasource);

 return (
   <>
     <div className='card'>
       <div className='card-header'>
         Brief Information
       </div>
       <div className='card-body p-0' style={{display:'grid', gridTemplateColumns:'20% auto'}}>
        <section className='p-2'>
            <Image src='/male-profile-pic.jpeg' className='img-fluid img-thumbnail' alt='edta tubes' width={100} height={100} />
         </section>
         <section className='d-flex flex-column  border-start'>
              <span className='border-bottom p-1 text-sm'>Name: {supplier.name} </span>
              <span className='border-bottom p-1 text-sm'>Address : {supplier.address } </span>
              <span className='border-bottom p-1 text-sm'>Contact: {supplier.phonenumber}  </span>
              <span className='p-1 text-sm'>Email: <Link href={`/mail/supplier/${supplier.email}`}>
                {supplier.email}
              </Link>
            </span>
         </section>
        </div>
     </div>
  </>
 )
}
