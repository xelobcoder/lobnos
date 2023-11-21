import React from 'react'

export default function Indicator({resultEntered}) {
  return (
    <div>
      <div className="d-flex justify-content-end mb-2 mt-1" >
        <div title={ resultEntered ? 'result previously entered' : 'result yet to be entered'}  className={resultEntered ? 'bg-success state-indicator' : 'bg-danger state-indicator'}
        >
        </div>
      </div>
    </div>
  )
}
