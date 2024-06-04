import  { useState,useContext } from 'react';
import OperationsContext from './OperationsContext';
import { customFetch, handleComments} from '../Auth/customFetch'
import SECOND_NO_DATA from '../accessories/secondNodata';
import { Info } from '@mui/icons-material';

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
    updateOperations({ billingid: item.billingid, patientid: item.patientid });
  };

  return (
    <>
      <div>
        <div className="bg-secondary-subtle br-5 mx-2 my-2 px-2 py-1">
          <div>
            <Info/> Filter
          </div>
          <div className="grid-3">
            <div className="form-row">
              <label> from</label>
              <input type="date" className="custom-input" onChange={(e) => handleComments(e, query, "from", setQuery)} />
            </div>
            <div className="form-row">
              <label>to</label>
              <input type="date" className="custom-input" onChange={(e) => handleComments(e, query, "to", setQuery)} />
            </div>
            <div className="form-row">
              <label>billing id</label>
              <input className="custom-input" id="billingid" onChange={(e) => handleComments(e, query, "billingid", setQuery)} />
            </div>
            <div className="form-row">
              <label>patientid</label>
              <input className="custom-input" id="billingid" onChange={(e) => handleComments(e, query, "patientid", setQuery)} />
            </div>
            <div className="form-row">
              <button
                className="btn btn-success btn-sm mt-2"
                onClick={(e) => {
                  submitData();
                }}>
                search
              </button>
            </div>
          </div>
        </div>
        <ul className="list-group br-0">
          {collection.length > 0 ? (
            collection.map((item, index) => (
              <li
                style={{ display: "grid", gridTemplateColumns: "10% 30% auto" }}
                className={`list-group-item pointer  ${
                  item?.billingid === operationsKey?.billingid ? "bg-primary fw-bold text-white border-primary" : ""
                }`}
                tabIndex={1 + index}
                onClick={(e) => handleUpdate(e, item)}
                key={index}>
                <span>
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path
                      d="M17 5H3h14zm0 5H3h14zm0 5H3h14z"
                      stroke="currentColor"
                      fill="none"
                      fill-rule="evenodd"
                      stroke-linejoin="round"></path>
                  </svg>
                </span>
                <span>{item.patientid}</span>
                <span>
                  {item.fullname} - {item.billingid}
                </span>
              </li>
            ))
          ) : (
            <SECOND_NO_DATA message={"No data"} />
          )}
        </ul>
      </div>
    </>
  );
}
