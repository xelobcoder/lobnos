import { Box, Button, Typography } from '@mui/material'
import React, { useState } from 'react'
import style from '../../styles/ready.module.css'
import { EnergySavingsLeaf, ViewDay, ViewHeadlineTwoTone } from '@mui/icons-material';

export default function ReadyList({ readydata, changeLayout }) {
  const [active, setActive] = useState(null);
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
            {/* <li>print</li> */}
            <li>view</li>
          </ul>
        </div>
        {readydata.length > 0 ? (
          readydata.map((item, index) => {
            return <>
              <div className={style.list} key={index} style={{ border: `${active == index ? '1px solid #2563eb' : 'none'}` }} >
                <ul key={index}>
                  <li style={{ color: '#3949ab' }}>{item.billingid}</li>

                  <li>{item.fullname}</li>

                  <li className={style.activated_ready} style={{ backgroundColor: `${item.status == 'Ready' ? 'green' : 'goldenrod'}` }} >
                    {item.status}
                  </li>

                  <li>{item.readycount}/{item.testcount}</li>

                  <li style={{ color: `${(parseInt(item.outstanding) >= 1 || parseInt(item.outstanding) <= -1) ? 'red' : null}` }}>{parseInt(item.outstanding)}</li>

                  <li>
                    {/* <ViewHeadlineTwoTone/> */}
                    {/* <ViewDay/> */}
                    <EnergySavingsLeaf onClick={(e) => { changeLayout('three', item.billingid); setActive(index) }} />
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
