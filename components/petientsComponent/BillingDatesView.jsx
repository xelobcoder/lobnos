import React from 'react'
import SECOND_NO_DATA from '../accessories/secondNodata';
export default function BillingDatesView({ source }) {

  return (
    <>
      {source.length === 0 && <SECOND_NO_DATA />}
      {/* billing dates of client will appear here */}
      {source.length > 0 && (
        source.map((item, index) => {
          return (
            <li className='p-2 text-primary m-0 hover-text-success  border-bottom cursor-pointer bg-opacity-50' key={index}>{item.date}</li>
          )
        })
      )}
    </>
  )
}
