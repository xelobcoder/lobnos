import React from 'react';
import { ChatRounded, ViewAgenda } from '@mui/icons-material';

export default function SecondOrgNav({router}) {
  return (
    <>
      <div className='container d-flex justify-content-end'>
        <button  className='btn btn-primary mt-2' onClick={router}>
          <ViewAgenda/> view organization
        </button>
      </div>
    </>
  )
}
