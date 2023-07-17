import React from 'react'
import Indicator from '../accessories/Reports/indicator'
import CommentSection from './commentSection'

export default function BleedingNClotting() {
  return (
    <>
      <div className='p-4'>
        <div>
          <h5>Bleeding and Clotting Time</h5>
          <form className='bg-white'>
            <Indicator resultEntered={false} />
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
                    <td>Bleeding Time</td>
                    <td><input type='text' /></td>
                    <td>mins</td>
                    <td>1-5</td>
                  </tr>
                  <tr>
                    <td>Clotting Time</td>
                    <td><input type='text' /></td>
                    <td>mins</td>
                    <td>3-8</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </form>
          <CommentSection/>
        </div>
      </div>
    </>
  )
}
