import { Box, Button } from '@mui/material'
import React, { useState } from 'react'
import style from '../../styles/ready.module.css'
import { EnergySavingsLeaf, ViewDay, ViewHeadlineTwoTone } from '@mui/icons-material';

export default function ReadyList({ readydata, changeLayout }) {
  const [clients, setClients] = useState(readydata);
  return (
    <>
      <Box sx={{ height: '80vh', overflowY: 'auto' }}>
        <div className={style.list}>
          <ul>
            <li>Billingid</li>
            <li>fullname</li>
            <li>status</li>
            <li>Number</li>
            <li>debt</li>
            <li>print</li>
            <li>view</li>
          </ul>
        </div>
        {clients.length > 0 ? (
          clients.map((item, index) => {
            return <>
              <div className={style.list} key={index} >
                <ul key={index}>
                  <li style={{ color: '#3949ab' }}>BILL{index}0</li>
                  <li>Tiifu Hamza Kojo  Hamza Kojo Boronson</li>
                  <li className='activated text-success'>ready</li>
                  <li>1/{index}</li>
                  <li style={{ color: 'red' }}>103</li>
                  <li>
                    <Button variant='contained' size='small' color='warning'>print</Button>
                  </li>
                  <li>
                    {/* <ViewHeadlineTwoTone/> */}
                    {/* <ViewDay/> */}
                    <EnergySavingsLeaf onClick={(e) => changeLayout('three')} />
                  </li>
                </ul>
              </div>
            </>
          })
        ) : null}
      </Box>
    </>
  )
}
