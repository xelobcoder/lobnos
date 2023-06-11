import React from 'react'

export default function PersonalInformation() {
  const data = [
    {
      "collection_date": "2023-06-04 00:00:00.000000",
      "processing_date": "2023-06-04 10:05:21.000000",
      "ready_date": null,
      "urgency": "moderate",
      "Phelobotomist": null,
      "gender": "male",
      "fullname": "Tiifu Kojo Hamza",
      "age": "27 years",
      "inspectionTime": "2023-06-03 20:45:44.000000",
      "samplingCenter": "Tiifu Hamza",
      "clinician": "Dr Paul Sinister"
    }
  ]

  return (
    <>
      <div>
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
      </div>
    </>
  )
}
