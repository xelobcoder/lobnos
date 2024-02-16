import React from 'react'

export default function Indicator({ resultEntered, ...props }) {
  return (
    <div className='d-flex justify-content-end'>
      <div
        {...props}
        title={resultEntered ? "result previously entered" : "result yet to be entered"}
        className={resultEntered ? "bg-success state-indicator" : "bg-danger state-indicator"}></div>
    </div>
  )
}
