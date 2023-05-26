import { Box, Button } from '@mui/material'
import React, { useState } from 'react'
import style from '../../styles/ready.module.css'
import { EnergySavingsLeaf, ViewDay, ViewHeadlineTwoTone } from '@mui/icons-material';

export default function ReadyList({ readydata, changeLayout }) {
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
        {readydata.length > 0 ? (
          readydata.map((item, index) => {
            return <>
              <div className={style.list} key={index} >
                <ul key={index}>
                  <li style={{ color: '#3949ab' }}>{item.billingid}</li>
                  <li>{item.fullname}</li>
                  <li>
                    <p className={style.activated_ready}>{item.status}</p>
                  </li>
                  <li>{item.readycount}/{item.testcount}</li>
                  <li style={{ color: `${(parseInt(item.outstanding) >= 1 || parseInt(item.outstanding) <= -1 ) ? 'red' : null}` }}>{parseInt(item.outstanding) }</li>
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
