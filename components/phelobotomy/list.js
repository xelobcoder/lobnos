import { List } from '@mui/material'
import React from 'react'

function Phelobotomy_USER_LIST({ data, index }) {
 const [status, setStatus] = React.useState(false)

 const calculatetimeElapsed = (date, currentdate) => {
 setInterval(() => {
   let timeElapsed = currentdate - new Date(date)
   // get time in minutes
   let minutes = Math.floor((timeElapsed / 1000 / 60) % 60)
   // get time in hours
   let hours = Math.floor((timeElapsed / 1000 / 60 / 60) % 24)
   return hours + ' hours ' + minutes + ' minutes'
  }, 500)
 }

 console.log(calculatetimeElapsed("28/02/25", new Date()))
 return (
  <>
   {data.map((item, index) => {
    return (
     <ul key={index} className="list-group">
      <li
       className={
        status == false ? 'alert alert-primary' : 'alert alert-danger'
       }
      >
       <div className="1">{index + 1}</div>
       <div>{item.PATIENTID}</div>
       <div className="test">{item.TEST}</div>
       <div className="date">{item.DATE.slice(0, 10)}</div>
       {/*  calculate time elapsed from date above*/}
       <div className="time">
        {calculatetimeElapsed(item.DATE, new Date())}
       </div>
      </li>
     </ul>
    )
   })}
  </>
 )
}

export default Phelobotomy_USER_LIST
