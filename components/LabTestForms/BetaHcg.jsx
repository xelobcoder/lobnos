import React, { useState, useEffect } from 'react'
import CommentSection from './commentSection'
export default function BetaHcg() {
  const [data, setData] = useState({})
  return (
    <div>
      <div className="p-2" style={{ backgroundColor: 'whitesmoke' }}>
        <div>
          <h5>Beta human chorionic hormone (Beta Hcg) test</h5>
          <form className="bg-white">
            <table id="entry-table-chemistry">
              <thead>
                <tr>
                  <th>paramater</th>
                  <th>value</th>
                  <th> unit</th>
                  <th>reference</th>
                </tr>
              </thead>
              <tbody >
                <tr className="border-bottom">
                  <td>beta hcg</td>
                  <td><input type='number' name='' style={{ height: '30px' }} step={'0.5'} /></td>
                  <td>ul/ml</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </form>
          <CommentSection />
        </div>
      </div>
    </div>
  )
}
