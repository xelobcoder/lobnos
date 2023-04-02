import { List, Button, endIcon } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import React from 'react';
import TEST_DETAILS from './sampleCollectionModal.js';

function Phelobotomy_USER_LIST({ item, index }) {

  const calculatetimeElapsed = (date, time, currentdate) => {
    let date1 = new Date(date)
    // get time difference from time 
    let timeDiff = currentdate - new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(), time.split(':')[0], time.split(':')[1])

    // get time difference in minutes
    let timeDiffMinutes = Math.round(((timeDiff % 86400000) % 3600000) / 60000)

    console.log(timeDiff / 1000 / 60)

    // get time difference in hours
    let timeDiffHours = Math.floor((timeDiff % 86400000) / 3600000);
    // get time difference in days

    return `${timeDiffHours} hours ${timeDiffMinutes} minutes`


  }

  return (
    <>
    </>
  )
}

export default Phelobotomy_USER_LIST
