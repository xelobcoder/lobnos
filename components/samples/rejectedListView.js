import React from 'react'
import GppBadIcon from '@mui/icons-material/GppBad';
import { useState } from 'react';
export default function RejectedListView({ listsource, selectedDefault, controller }) {

 return (
  <>
   <div className='rejected-sample-list-wrapper m-1'>
    {/* for each show transactionid */}
    {/* for each show patientid */}
    {
     listsource.length > 0 ? listsource.map((item, index) => {
      return (
       <>
        <div className='rejected-sample-list bg-white' key={index}>
         <div 
          onClick={() => controller(item.BILLINGID)} className={selectedDefault === item.BILLINGID ? 'active-rejected-list' : ''}
         >
          <p style={{borderBottom:'1px solid lightgray',padding:'5px',cursor:'pointer'}} className='mb-0' >{item.PATIENTID}: {item.FULLNAME}
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
