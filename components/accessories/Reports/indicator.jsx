import React from 'react'

export default function Indicator({ resultEntered, ...props }) {
  return (
    <div
      {...props}
      title={resultEntered ? "result previously entered" : "result yet to be entered"}
      className={resultEntered ? "bg-success state-indicator" : "bg-danger state-indicator"}></div>
  )
}
