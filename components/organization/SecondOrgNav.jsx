import React from 'react';
import { ChatRounded, ViewAgenda } from '@mui/icons-material';

export default function SecondOrgNav({router}) {
  return (
    <>
      <div className='container d-flex justify-content-end'>
        <button variant='contained' className='mt-2 mb-2 custom-button primary' onClick={router}>
          <ViewAgenda/> view organization
        </button>
        <button className='custom-button mt-2 mb-2 green'>
          <ChatRounded />   chart
        </button>
      </div>
    </>
  )
}
