import React from 'react'

export default function TableIsLoading({col}) {
  return (
    <tr>
      <td colSpan={col} className='text-center'>
        <div className='spinner-border' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </td> 
    </tr>
  )
}
