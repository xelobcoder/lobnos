import { useCallback, useState } from 'react'
import Indicator from '../accessories/Reports/indicator'
import CommentSection from './commentSection'
import { handleComments, handleResponse, validateFormData, handleChangeWithState,getHematologicalResultEntered } from '../Auth/customFetch'
import { useEffect } from 'react'
import ISLOADING from '../isLoading'

export default function Helicobacter_Pylori({ clientdata,employeeid}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ specimen: '', result: '', comments: '' });
  const [resultEntered, setResultEntered] = useState(false);
  const { billingid, test, testid, patientid } = clientdata;

  const handleResult = async () => {
    await validateFormData({ ...data, billingid, testname: test, testid, patientid,employeeid}, true, [], 'test/result/enter', handleResponse);
  }


  const getPreviousResult = useCallback(async () => {
      getHematologicalResultEntered(billingid, test, setLoading, setData, setResultEntered);
    }, [billingid, test])

  useEffect(() => {
   getPreviousResult();
  }, [getPreviousResult])


  const renderer = () => {
    if (loading) return <ISLOADING />
    else {
      return (
        <div>
          <table className="billing-cart-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>specimen type</td>
                <td>
                  <select
                    className="custom-input"
                    value={data.specimen}
                    onChange={(e) => handleChangeWithState(e, "specimen", setData, data)}>
                    <option value="">select an option </option>
                    <option value="stool">stool</option>
                    <option value="blood">blood</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>result</td>
                <td>
                  <select className="custom-input" value={data.result} onChange={(e) => handleChangeWithState(e, "result", setData, data)}>
                    <option value="">select an option </option>
                    <option value="reactive">reactive</option>
                    <option value="non reactive">non reactive</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <CommentSection target={"comments"} datasource={data} value={data.comments} getcomment={handleComments} datafunction={setData} />
          <button className="btn btn-primary btn-sm mx-1" onClick={handleResult}>
            Save result
          </button>
        </div>
      )
    }
  }

  return (
    <>
      <div className="mx-2">
        <div className="card">
          <div className="card-header p-1 bg-secondary text-white">
            <h5 className='mt-2 mx-2'>Helicobacter Pylori</h5>
            <Indicator resultEntered={resultEntered} />
          </div>
          <div className="card-body">
            {renderer()}
          </div>
        </div>
      </div>
    </>
  )
}
