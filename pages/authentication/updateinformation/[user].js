import React from 'react';
import { useRouter } from 'next/router';

export default function EditUserInformation() {
  const router = useRouter();
  const { user } = router.query;
  return (
    <div>
      <div className='card m-4'>
        <div className='card-header'>
          <h6 className='text-capitalize'>Edit user</h6>
        </div>
        <div className='card-body'>
          {user}
        </div>
      </div>
    </div>
  )
}
