import { Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CommentSection from './commentSection'
import Indicator from '../accessories/Reports/indicator'
import { CheckResultEntered, customPost } from '../Auth/customFetch';

export default function HbA1c({ clientdata }) {
  const [client, setclientdata] = useState(clientdata);
  const [resultEntered, setResultEntered] = useState(false);
  const [formdata, setFormData] = useState({ glycated: '', glucose: '', technology: '', method: '', comment: '' })

  // used to determine if result has been entered
  useEffect(() => {
    try {
      const verify = async function () {
        const response = await CheckResultEntered('glycated_haemoglobin', client.billingid);
        const { result, records } = response;
        setResultEntered(result)
      }
      // 
      verify();
    }
    catch (err) {
      console.log(err)
      setResultEntered(false)
    }
  }, [])

  // handle Result

  const handleResult = (e) => {
    const { name } = e.target;
    setFormData({ ...formdata, [name]: e.target.value });
  }



  // this handles senfing data to the server


  async function saveData() {
    let sendResponse = await customPost('test/result/enter', 'POST',
      { ...formdata, billingid: client.billingid, patientid: client.patientid, testname: 'glycated_haemoglobin' })
      alert(sendResponse?.message)
  }





  return (
    <>
      <div className='mx-3'>
        <div className='card'>
          <div className='card-header modal-color'>
            <h5>Glycated Heamoglobin</h5>
            <Indicator resultEntered={resultEntered} />
          </div>
          <div className='card-body'>
            <table className='billing-cart-table' >
              <thead>
                <tr>
                  <th>testname</th>
                  <th>value</th>
                  <th>unit</th>
                  <th>reference range</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>HbAic</td>
                  <td>
                    <input type='number' step={'0.5'} className='custom-input'
                      value={formdata.glycated} name='glycated' onChange={(e) => handleResult(e)} />
                  </td>
                  <td>
                    %
                  </td>
                  <td>
                    Below 6.0% - Normal value
                    <br />
                    6.0% - 7.0% - Good control value
                    <br />
                    8.0% - 10% - Unsatisfactory control value
                    <br />
                    Above 10% - Poor control value
                    <br />
                    7.0% - 8.0% - Fair control value
                    <br />
                  </td>
                </tr>
                <tr>
                  <td> <label>AVERAGE BLOOD GLUCOSE (ABG)</label></td>
                  <td>
                    <input type='number' step={0.5}
                      value={formdata.glucose} name='glucose' className='custom-input' onChange={(e) => handleResult(e)} />
                  </td>
                  <td>
                    %
                  </td>
                  <td>
                    90 - 120 mg/dl : Excellent Control
                    <br />
                    121 - 150 mg/dl : Good Control
                    <br />
                    151 - 180 mg/dl : Average Control
                    <br />
                    181 - 210 mg/dl : Action Suggested
                    <br />
                    211 mg/dl : Panic Value
                    <br />
                  </td>
                </tr>
              </tbody>
            </table>
            <div>
              <label>Technology Used</label>
              <input type='text' className='custom-input' name='technology' onChange={(e) => handleResult(e)} value={formdata.technology} />
              <div className='form-group'>
                <label>method</label>
                <input className='custom-input' value={formdata.method} placeholder='Method used' name='method' onChange={(e) => handleResult(e)} />
              </div>
              <CommentSection getcomment={handleResult} value={formdata.comment} />
              <div className='form-group mx-1 my-2'>
                <button className='btn btn-primary btn-sm' onClick={saveData}>
                  save result
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
