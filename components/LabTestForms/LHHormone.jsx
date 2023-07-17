import React from 'react'
import Indicator from '../accessories/Reports/indicator'
import CommentSection from './commentSection';
import { Button } from '@mui/material';
export default function LHHormone() {
  return (
    <>
      <div className='p-4'>
        <div>
          <h5>Leutinizing  Hormone (LH)</h5>
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
                    <td>LH</td>
                    <td><input type='text' /></td>
                    <td>U/L</td>
                    <td>2.4-12.6</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
          <CommentSection />
          <Button variant='contained' color='primary' className='mt-4'>
            Submit
          </Button>

        </div>
      </div>
    </>
  )
}
