import React, { useState } from 'react'
import Indicator from '../accessories/Reports/indicator'
import { Autocomplete, TextField, Button } from '@mui/material';
import CommentSection from './commentSection';

export default function Pregnancy() {
  const option = ['positive', 'negative'];
  const method = ['Urine', 'Blood']
  const [result, setResults] = useState({
    reaction: 'Negative',
    method: 'Urine',
    comments: ''
  })
  return (
    <>
      <div className="p-4">
        <div>
          <form>
            <Autocomplete
              options={option}
              getOptionLabel={(option) => option}
              value={result.reaction}
              size='small'
              onChange={(event, newValue) => {
                setResults({
                  ...result, reaction: newValue
                })
              }}
              renderInput={(params) => <TextField {...params} label="Pregnancy test" variant="outlined" />}
            >
            </Autocomplete>
            <div className='form-group mt-3'>
              <Autocomplete
                options={method}
                getOptionLabel={(method) => method}
                value={result.method}
                size='small'
                onChange={(event, newValue) => {
                  setResults({
                    ...result, method: newValue
                  })
                }}
                renderInput={(params) => <TextField {...params} label="method of  test" variant="outlined" />}
              >
              </Autocomplete>
            </div>
            <CommentSection />
          </form>
          <Button variant='contained' onClick={(e) => handleResult(e)} color='primary' sx={{ mt: 2 }}>save results</Button>
        </div>
      </div>
    </>
  )
}
