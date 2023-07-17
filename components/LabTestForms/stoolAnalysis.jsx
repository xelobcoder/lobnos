import { Typography, Autocomplete, TextField, Button } from '@mui/material'
import React, { useState } from 'react'
import data from './stoolAnalaysisData'
import CommentSection from './commentSection'
import Indicator from '../accessories/Reports/indicator'

export default function StoolAnalysis() {
  const [resultEntered, setResultEntered] = useState(false);
  const [result, setResult] = useState(data)


  const onChange = (e,newValue,name) => {
    setResult(result.map(item => {
      if (item.name == name) {
        return { ...item, value: newValue }
      }
      return item
    }))
    console.log(result)
  }
  return (
    <div className='p-4'>
      <div>
        <Typography variant='h5'>
          Stool Analysis Report Form
        </Typography>
        <form className='bg-white'>
          <Indicator resultEntered={resultEntered} />
          <table id='entry-table-chemistry'>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {
                result.map((item, index) => {
                  return (
                    <tr key={index} className='border-bottom'>
                      <td>{item.name}</td>
                      <td>
                        <Autocomplete
                          size='small'
                          name={item.name}
                          disablePortal
                          value={item.value}
                          onChange={(e, newValue) => onChange(e, newValue, item.name)}
                          id={item.name}
                          options={item.options}
                          renderInput={(params) => <TextField {...params} label={item.name} />}
                        />
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
          {/* consistens */}
        </form>
        <CommentSection />
        <Button variant='contained' color='primary' className='mt-3'>Submit</Button>
      </div>
    </div>
  )
}
