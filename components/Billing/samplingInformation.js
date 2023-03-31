import React from 'react'

export default function SamplingInformation({ source }) {
  console.log(source)
  return (
    <div>
      <div className="billing-personal-info">
        <div className="billing-personal-info-header">
          <div className="split">
            <h4 className="text-white bg-success">
              Sampling Information
            </h4>
          </div>
        </div>
        <div className='grid-50'>
          <div >
            <div className='sampling-billing-info'>
              <div className='text-header'>
                billing date :
              </div>
              <div className='text-body'>
                {source[0]?.["BILLED_ON"].slice(0, 10)}
              </div>
            </div>
            <div className='sampling-billing-info'>
              <div className='text-header'>
                billing Time:
              </div>
              <div className='text-body'>
                {source[0]?.["BILLED_ON"].slice(12, 19)}
              </div>
            </div>
            <div className='sampling-billing-info'>
              <div className='text-header'>
                phelobotomy or sample received status:
              </div>
              <div className='text-body'>
                {source[0]?.["PHELOBOTOMY_STATUS"] == 'DONE' && (
                  <button className='btn btn-success btn-sm'>
                    {source[0]?.["PHELOBOTOMY_STATUS"]}
                  </button>
                )}
                {
                  source[0]?.["PHELOBOTOMY_STATUS"] == 'QUEUE' && (
                    <button className='btn btn-warning btn-sm'>
                      {source[0]?.["PHELOBOTOMY_STATUS"]}
                    </button>
                  )

                }
                {
                  source[0]?.["PHELOBOTOMY_STATUS"] == 'INCOMPLETE' && (
                    <button className='btn btn-danger btn-sm'>
                      {source[0]?.["PHELOBOTOMY_STATUS"]}
                    </button>
                  )
                }
              </div>
            </div>
            <div className='sampling-billing-info'>
              <div className='text-header'>
                sample inspection status:
              </div>
              <div className='text-body'>
                {source[0]?.["SAMPLE_STATUS"] === 'PENDING' && (
                  <button className='btn btn-warning btn-sm'>
                    {source[0]?.["SAMPLE_STATUS"]}
                  </button>
                )}
                {
                  source[0]?.["SAMPLE_STATUS"] === 'ACCEPTED' && (
                    <button className='btn btn-success btn-sm'>
                      {source[0]?.["SAMPLE_STATUS"]}
                    </button>
                  )
                }
                {
                  source[0]?.["SAMPLE_STATUS"] === 'REJECTED' && (
                    <button className='btn btn-danger btn-sm'>
                      {source[0]?.["SAMPLE_STATUS"]}
                    </button>
                  )
                }
              </div>
            </div>
          </div>
          <div>
            {/* inspection time */}
            <div className='sampling-billing-info'>
              <div className='text-header'>
                inspection time:
              </div>
              <div className='text-body'>
                {source[0]?.["INSPECTION_TIME"] || 'N/A'}
              </div>
            </div>
            <div className='sampling-billing-info'>
              <div className='text-header'>
                urgency:
              </div>
              <div className='text-body'>
                {
                  source[0]?.["URGENCY"] === 'emmergency' && (
                    <button className='btn btn-danger btn-sm'>
                      {source[0]?.["URGENCY"]}
                    </button>
                  )
                }
                {
                  source[0]?.["URGENCY"] === 'moderate' && (
                    <button className='btn btn-warning btn-sm'>
                      {source[0]?.["URGENCY"]}
                    </button>
                  )
                }
                {
                  source[0]?.["URGENCY"] === 'none' && (
                    <button className='btn btn-success btn-sm'>
                      {source[0]?.["URGENCY"]}
                    </button>
                  )
                }
              </div>
            </div>
            <div className='sampling-billing-info'>
              <div className='text-header'>
                sampling center:
              </div>
              <div className='text-body'>
                {source[0]?.['SAMPLING_CENTER']}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
