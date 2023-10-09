import React from 'react'
import Accord from '../accessories/Accord';


export default function PendingTableSample({ data, setShow,removeClient }) {
  // this is trigger after the pending sample list of a client becomes zero
  // this will remove the client from the sample list 

  return (
    <div>
      {/* using mui accordion */}
      <div className='list-group'>
        {data.map((item, index) => {
          return (
            <Accord key={index} data={item}   removeClient={removeClient}/>
          )
        })}
      </div>
    </div>
  )
}
