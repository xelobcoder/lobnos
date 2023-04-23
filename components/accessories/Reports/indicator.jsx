import React from 'react'

export default function Indicator({resultEntered}) {
  return (
    <div>
      <div className="d-flex justify-content-end mb-2 mt-1" >
        <div className={resultEntered ? 'bg-success state-indicator' : 'bg-danger state-indicator'}
        >
        </div>
      </div>
    </div>
  )
}
