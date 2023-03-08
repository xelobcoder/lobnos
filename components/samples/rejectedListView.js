import React from 'react'
import GppBadIcon from '@mui/icons-material/GppBad';
import { useState } from 'react';
export default function RejectedListView({ listsource, selectedDefault, controller }) {

 return (
  <>
   <div className='rejected-sample-list-wrapper'>
    {/* for each show transactionid */}
    {/* for each show patientid */}
    {
     listsource.length > 0 ? listsource.map((item, index) => {
      return (
       <>
        <div className='rejected-sample-list' key={index}>
         <div style={{ display: 'grid', padding: '10px', backgroundColor: 'whitesmoke', margin: '4px 4px', cursor: 'pointer', gridTemplateColumns: '20% auto' }}
          onClick={() => controller(item.BILLINGID)} className={selectedDefault === item.BILLINGID ? 'active-rejected-list' : ''}
         >
          {/* error icon here */}
          <GppBadIcon color='error' fontSize='large' />
          <p className='mb-1' >{item.PATIENTID}
           <br></br>
           <span>{item.FULLNAME}</span>
          </p>
         </div>
        </div>
       </>
      )
     }) : <div className='text-center rejected-sample-list'>No data</div>
    }
   </div>
  </>
 )
}
