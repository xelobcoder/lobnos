import { Card } from '@mui/material'
import style from '../../styles/ready.module.css'
import React, { useEffect, useState } from 'react'
import { customFetch } from '../Auth/customFetch'
import { Email, Print, WhatsApp } from '@mui/icons-material';

export default function ReadyTest({ id }) {
  const [test, setTest] = useState([]);

  const getTest = async () => {
    try {
      const response = await customFetch(`result/ready/:${id}`)
      setTest(response)
      console.log(response)
    }
    catch (err) {
      alert('error in connecting to server')
    }
  }


  useEffect(() => {
    getTest();
  }, [id])

  return (
    <div>
      <Card sx={{ height: 'max-content', backgroundColor: 'whitesmoke' }}>
        {
          test.length > 0 && (
            test.map((item, index) => {
              return (
                <>
                  <ul key={index} className={style.dropdownlist}>
                    <li>
                      {item.name}
                    </li>
                    {
                      item.ready == 'true' && (<>
                        <li className='text-primary'>share via</li>
                        <li>
                          {item.ready == 'true' && <Print sx={{color:'gray'}}/>}
                        </li>
                        <li>
                          <WhatsApp color='success'/>
                        </li>
                        <li>
                          <Email color='primary'/>
                        </li>
                      </>)
                    }
                  </ul>
                </>
              )
            })
          )
        }
      </Card>
    </div>
  )
}
