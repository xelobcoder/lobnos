import  { useState,useContext } from 'react';
import OperationsContext from './OperationsContext';
import { customFetch, handleComments} from '../Auth/customFetch'
import SECOND_NO_DATA from '../accessories/secondNodata';
import Accordion from 'react-bootstrap/Accordion';
export default function ResultEnteredSidePanel() {
  const [query, setQuery] = useState({ from: '', to: '', billingid: '', patientid: '' });
  const [collection, setCollection] = useState(([]));
  const { operationsKey, updateOperations } = useContext(OperationsContext)

  const submitData = async function () {
    const { from, to, billingid, patientid } = query;
    const response = await customFetch(`operations/collection/result?from=${from}&&to=${to}&&billingid=${billingid}&&patientid=${patientid}`);
    const { statusCode, status, result } = response;
    if (statusCode == 200 && status == 'success') {
      setCollection(result)
    }
  }

  const handleUpdate = (e, item) => {
    updateOperations({ billingid: item.billingid, patientid: item.patientid })
  }



  return (
    <>
      <div>
        <Accordion flush >
          <Accordion.Item>
          <Accordion.Header>
             Filter result
          </Accordion.Header>
          <Accordion.Body className='p-0'>
              <div className='bg-warning br-5 mx-2 my-2 px-2 py-1'>
                <label> from</label>
                <input type='date'  className='form-control' onChange={(e) => handleComments(e, query, 'from', setQuery)} />
                <label>to</label>
                <input type='date' className='form-control' onChange={(e) => handleComments(e, query, 'to', setQuery)} />
                <label>billing id</label>
                <input className='form-control' id='billingid' onChange={(e) => handleComments(e, query, 'billingid', setQuery)} />
                <label>patientid</label>
                <input className='form-control' id='billingid' onChange={(e) => handleComments(e, query, 'patientid', setQuery)} />
                <button className='btn btn-success btn-sm mt-2'
                  onClick={(e) => { submitData() }}>search</button>
              </div>
          </Accordion.Body>
         </Accordion.Item>
       </Accordion>
        <ul>
          {collection.length > 0 ? (
            collection.map((item, index) => (
              <li
                className={item?.billingid === operationsKey?.billingid ? 'bg-primary fw-bold text-white border-primary': ''}
                tabIndex={1 + index}
                onClick={(e) => handleUpdate(e, item)}
                key={index}
              >
                {/* <BloodtypeIcon /> */}
                {item.fullname} - {item.billingid}
              </li>
            ))
          ) : (
            <SECOND_NO_DATA message={"No data"} />
          )}
        </ul>
      </div>
    </>
  )
}
