import React, { useState } from 'react'

export default function SamplingInformationResult() {
  const [Details, samplingDetails] = useState([]);

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
        <h6 className='result-section-header'>
          Sampling Information
        </h6>
        <div className='sampling-result'>
          <div className='left-panel'>
            <div className='result-sampling-details'>
              <div className='left'>
                collected:
              </div>
              <div className='right'>
                {data[0]?.collection_date.slice(0, 10)}
              </div>
            </div>
            <div className='result-sampling-details'>
              <div className='left'>
                processed:
              </div>
              <div className='right'>
                {data[0]?.processing_date.slice(0, 10)}
              </div>
            </div>
            <div className='result-sampling-details'>
              <div className='left'>
                result ready:
              </div>
              <div className='right'>
                {data[0]?.ready_date != null ? data[0]?.ready_date.slice(0, 10) : ''}
              </div>
            </div>
            <div className='result-sampling-details'>
              <div className='left'>
                sampling center:
              </div>
              <div className='right'>
                {data[0]?.samplingCenter}
              </div>
            </div>
          </div>
          <div className='right-panel'>
            <div className='result-sampling-details'>
              <div className='left'>
                urgency:
              </div>
              <div className='right'>
                {data[0]?.urgency}
              </div>
            </div>
            <div className='result-sampling-details'>
              <div className='left'>
                Phelobotomist:
              </div>
              <div className='right'>
                {data[0]?.Phelobotomist != null ? data[0]?.Phelobotomist : 'N.A'}
              </div>
            </div>
            <div className='result-sampling-details'>
              <div className='left'>
                inspection Time:
              </div>
              <div className='right'>
                {data[0]?.inspectionTime.slice(0, 19)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
