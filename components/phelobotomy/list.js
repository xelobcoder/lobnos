import { List, Button, endIcon } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import React from 'react';
import TEST_DETAILS from './details';

function Phelobotomy_USER_LIST({ item, index }) {
 const [status, setStatus] = React.useState(false);
 const [display, setDisplay] = React.useState(false);

 const calculatetimeElapsed = (date, time, currentdate) => {
  let date1 = new Date(date)
  // get time difference from time 
  let timeDiff = currentdate - new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(), time.split(':')[0], time.split(':')[1])

  // get time difference in minutes
  let timeDiffMinutes =  Math.round(((timeDiff % 86400000) % 3600000) / 60000)

  console.log(timeDiff/1000/60)

  // get time difference in hours
  let timeDiffHours = Math.floor((timeDiff % 86400000) / 3600000);
  // get time difference in days


  return `${timeDiffHours} hours ${timeDiffMinutes} minutes`


 }

 return (
  <>
   <ul key={index} className="list-group">
    <li
     className={
      status == false ? 'alert alert-primary' : 'alert alert-danger'
     }
    >
     <div className="1">{index + 1}</div>
     <div>{item.PATIENTID}</div>
     <div className="test" title={item.TEST}>
      {item.TEST}
     </div>
     <div className="date">{item.DATE.slice(0, 10)}</div>
     {/*  calculate time elapsed from date above*/}
     <div className="time">
      {calculatetimeElapsed(item.DATE, item.TIME, new Date())}
     </div>
     <div>
      <Button
       endIcon={<ArrowDropDownIcon />}
       variant="contained"
       color="primary"
       sx={{ borderRadius: '0px' }}
       onClick={(e) => { setDisplay(!display) }}
      >
       view
      </Button>
     </div>
    </li>
   </ul>
   <div>
    {display == true ? (<TEST_DETAILS data={item} />) : null}
   </div>
  </>
 )
}

export default Phelobotomy_USER_LIST
