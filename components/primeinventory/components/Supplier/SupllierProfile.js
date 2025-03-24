import Image from 'next/image';
import Link from 'next/link';

export default function SupllierProfile({ datasource }) {

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
           <span className='border-bottom text-capitalize p-1 text-sm'>Name: {datasource.name} </span>
           <span className='border-bottom text-capitalize p-1 text-sm'>Address : {datasource.address} </span>
           <span className='border-bottom text-capitalize p-1 text-sm'>Contact: {datasource.phonenumber}  </span>
           <span className='p-1 text-sm'>Email: <Link ping='true' href={`/mail/datasource/${datasource.email}`}>
             {datasource.email}
              </Link>
            </span>
         </section>
        </div>
     </div>
  </>
 )
}
