import {useCallback, useEffect, useState} from 'react'
import Indicator from '../accessories/Reports/indicator'
import CommentSection from './commentSection'
import {  customPost, getHematologicalResultEntered, handleComments} from '../Auth/customFetch'
import { toast, ToastContainer } from 'react-toastify';
import ISLOADING from '../isLoading';

export default function BleedingNClotting({ clientdata }) {
  const {billingid, patientid,test,testid} = clientdata;
  const [resultEntered, setResultsEntered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({ bleedingtime: '', clottingtime: '', comments: '' });

  const getPreviousInfo = useCallback(async () => {
   await  getHematologicalResultEntered(billingid,test, setLoading, setResult, setResultsEntered );
  }, [billingid, test]);

  useEffect(() => {
    if (billingid && test) {
      getPreviousInfo();
   }
  }, [billingid, test,getPreviousInfo]);
  


 
  const handleResult = async (ev) => { 
    ev.preventDefault();
    const data = { patientid, billingid, testname: test, testid, ...result };
    const response = await customPost('test/result/enter', 'POST', data);
    const { message, status, statusCode } = response;
    if (status === 'success' && statusCode === 200) {
     toast.success(message);
      setResultsEntered(true);
    } else {
     toast.error(message);
    }
  }
  return (
    <>
      <ToastContainer/>
      <div className='mx-3'>
          <div className='card'>
            <div className='card-header'>
              <h4>Bleeding and clotting time</h4>
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
                    <th>Unit</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Bleeding Time</td>
                  <td>
                    <input className='custom-input' type='number' value={result.bleedingtime} onChange={(e) => setResult({...result, bleedingtime: e.target.value})} />
                    </td>
                    <td>mins</td>
                    <td>1-5</td>
                  </tr>
                  <tr>
                    <td>Clotting Time</td>
                  <td>
                    <input className='custom-input' type='number' value={result.clottingtime} onChange={(e) => setResult({...result, clottingtime: e.target.value})} />
                    </td>
                    <td>mins</td>
                    <td>3-8</td>
                  </tr>
                </tbody>
            </table>
            <CommentSection getcomment={handleComments} target={'comments'} datafunction={setResult} datasource={result} value={result.comments} />
        <button className='btn btn-primary btn-sm my-3 mx-1' onClick={(ev) => {handleResult(ev)}}>Save Result</button>
              </>
            )}
            </div>
          </div>
        </div>
    </>
  )
}
