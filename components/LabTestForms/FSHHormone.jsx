import React from 'react'
import CommentSection from './commentSection'
import { Button } from '@mui/material';
import Indicator from '../accessories/Reports/indicator';

export default function FSHHormone() {
  return (
    <>
      <div className='p-4'>
        <div>
          <h5>Follicle Stimulating Hormone (FSH)</h5>
          <Indicator resultEntered={false} />
          <form className='bg-white'>
            <div >
              <table id='entry-table-chemistry'>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Unit</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>FSH</td>
                    <td><input type='text' /></td>
                    <td>U/L</td>
                    <td>3.5-12.5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
          <CommentSection/>
          <Button variant='contained' color='primary' className='mt-4'>
            Submit
          </Button>

        </div>
      </div> 
    </>
  )
}
