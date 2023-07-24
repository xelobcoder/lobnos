import React from 'react'

export default function Tip({ header, body }) {
  return (
    <>
      <div className='card bg-white br-5'>
        <div className='card-header bg-light text-warning'>
          {header}
        </div>
        <div className='card-body text-dark'>
          {body}
        </div>
      </div>
    </>
  )
}
