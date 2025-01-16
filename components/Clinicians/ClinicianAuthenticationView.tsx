import React from 'react'

export default function ClinicianAuthenticationView() {
     return (
          <div className='card'>
               <div className='card-header bg-secondary-subtle pls-color fw-bold'>
                    Authentication Changes
               </div>
               <div className='card-body'>
                    <div className='grid-reg'>
                         <label className='pls-label pls-color'>
                              Authenticated
                         </label>
                         <input type='checkbox' />
                    </div>
               </div>
          </div>
     )
}
