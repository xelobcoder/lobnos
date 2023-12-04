import {  Autocomplete, TextField} from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import data from './stoolAnalaysisData'
import CommentSection from './commentSection'
import { ToastContainer,toast } from 'react-toastify'
import Indicator from '../accessories/Reports/indicator'
import ISLOADING from '../isLoading'
import {validateFormData,handleResponse, handleComments, customFetch, CheckResultEntered } from '../Auth/customFetch'

export default function StoolAnalysis({ employeeid, clientdata }) {
  const {billingid,testid,test,patientid} = clientdata;
  const [resultEntered, setResultEntered] = useState(false);
  const [result, setResult] = useState(data);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({comments:''});
  


  const onChange = (e,newValue,name) => {
    setResult(result.map(item => {
      if (item.name == name) {
        return { ...item, value: newValue }
      } else {
        return item;
      }
    }))
  }

  const getPreviousResult = useCallback(async () => {
    try {
      const response = await CheckResultEntered(test, billingid);
      const { status, statusCode, message, result, records } = response;
      if (statusCode === 200 && status == 'success' && records.length > 0 && result) {
        setResultEntered(true);
        setLoading(false);
  
        const previousResult = JSON.parse(records[0]['results']);
        const comments = records[0]['comments'];
        const structuredResult = data.map(item => {
          for (let i = 0; i < previousResult.length; i++) {
            if (item.name == previousResult[i].name) {
              return { ...item, value: previousResult[i].value }
            }
          }
        })
  
        setResult(structuredResult);
        setComments({ comments: comments });
      } else {
        setLoading(false);
        setResultEntered(false);
      }
    } catch (err) {
      toast.error(err?.message || 'something went wrong', { autoClose: 1000 });
      setLoading(false);
      setResultEntered(false);
    }
  }, [billingid, test]);

  useEffect(() => {
    getPreviousResult();
  }, [getPreviousResult]);


  const handleResult = async () => { 
    const structuredResukt = result.map(item => { 
      return { name: item.name, value: item.value }
    })
    const data = { patientid, testid, testname: test, data: structuredResukt, employeeid, billingid, comments: comments.comments };
    await validateFormData(data,true,[],'test/result/enter',handleResponse)
  }

  return (
    <div className='mx-3'>
      <ToastContainer/>
      <div className='card'>
        <div className='card-header bg-secondary text-white'>
          <h4>Stool Analysis Report Form</h4>
          <Indicator resultEntered={resultEntered} />
        </div>
        <div className='card-body'>
          {loading && <ISLOADING />}
          {!loading && (
            <>
              <table className='billing-cart-table'>
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
              <CommentSection getcomment={handleComments} target={'comments'} datafunction={setComments} value={comments.comments} datasource={comments}/>
          <button  type='button' onClick={handleResult} className='btn btn-primary btn-sm mx-1 my-4'>Submit</button >
            </>
          )}
        </div>
      </div>
    </div>
  )
}
