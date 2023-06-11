import React from 'react'

export default function PersonalInformation({ data = []}) {
  return (
    <>
      {
        data.length > 0 && (<div>
          <h6 className='result-section-header'>Personal Information</h6>
          <div className='result-sampling-details'>
            <div className='left'>fullname: </div>
            <div className='right'>
              {data[0]?.['fullname']}
            </div>
          </div>
          <div className='result-sampling-details'>
            <div className='left'>gender: </div>
            <div className='right'>
              {data[0]?.['gender']}
            </div>
          </div>
          <div className='result-sampling-details'>
            <div className='left'>age: </div>
            <div className='right'>
              {data[0]?.['age']}
            </div>
          </div>
          <div className='result-sampling-details'>
            <div className='left'>ordering clinician: </div>
            <div className='right'>
              {data[0]?.['clinician']}
            </div>
          </div>
        </div>)
      }
    </>
  )
}
