import { Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CommentSection from './commentSection'
import Indicator from '../accessories/Reports/indicator'
import { CheckResultEntered, customPost, handleComments } from '../Auth/customFetch';
import { ToastContainer, toast } from 'react-toastify';

export default function HbA1c({ clientdata }) {
  const { billingid, patientid, testid, test } = clientdata;
  const [resultEntered, setResultEntered] = useState(false);
  const [formdata, setFormData] = useState({ result:  '', glucose: '',  comments: '' })

  // used to determine if result has been entered.
  useEffect(() => {
    try {
      if (billingid) {
        const verify = async function () {
          const response = await CheckResultEntered(test, billingid);
          const { result, records, statusCode } = response;
          if (statusCode === 200 && records.length > 0) {
            setResultEntered(result); 
            setFormData(records[0])
          }
        }
        verify();
      }
    }
    catch (err) {
      setResultEntered(false)
    }
  }, [test,billingid])

  // handle Result

  const handleResult = (e) => {
    const { name } = e.target;
    setFormData({ ...formdata, [name]: e.target.value });
  }



  // this handles senfing data to the server


  async function saveData() {
    const data = { patientid, billingid, testname: test, ...formdata , testid};
    let sendResponse = await customPost('test/result/enter', 'POST', data);
    const { statusCode, status,message } = sendResponse;
    if (statusCode === 200 && status === 'success') {
      toast.success(message)
    } else {
      toast.error(message);
    }
  }





  return (
    <>
      <ToastContainer/>
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
                      value={formdata.result} name='result' onChange={(e) => handleResult(e)} />
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
              <CommentSection getcomment={handleComments} datafunction={setFormData} target={'comments'} datasource={formdata} value={formdata.comments}/>
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
