import { Card, CardContent, Typography } from '@mui/material';
import style from '../../styles/ready.module.css';
import React from 'react'

export default function Sampling({ data }) {
  return (
    <div>
      <Card className={style.card}>
        <CardContent className='d-flex justify-content-center'>
          <div>
            <Typography variant='h6'  className='text-lead'>
              {data.title}
            </Typography>
            <Typography variant='h3' sx={{ fontStyle: 'bold',display:'flex',justifyContent:'center' }}>
              {data.value}
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
