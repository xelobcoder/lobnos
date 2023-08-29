import React, { useState, useMemo, Suspense, useContext, useEffect } from 'react';
import { customFetch, getDepartment } from '../Auth/customFetch';
import OperationsContext from './OperationsContext';
import { useRouter } from 'next/router';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import SECOND_NO_DATA from '../accessories/secondNodata';


export default function OperationsTestCollection() {
  const { operationsKey, updateOperations } = useContext(OperationsContext)
  const [collection, setCollections] = useState([]);
  const [departments, setDepartments] = useState([])
  const [query, setQuery] = useState({ bydept: false, queryDept: 0 })



  // get department from router query

  const { departmentid } = useRouter().query;

  // intial data fetching from the server
  const getCollection = async function () {
    let url = `operations/collection?category=${departmentid}`;

    try {
      const response = await customFetch(url)

      if (response?.result == false) {
        setCollections([])
      } else {
        setCollections(response?.result)
      }
    }
    catch (err) {
      console.log(err)
    }
  }





  useEffect(() => {
    getDepartment(setDepartments)
    setQuery({ bydept: true, queryDept: departmentid });
    getCollection()
  }, [])



  useEffect(() => {
    getCollection();
  }, [query.queryDept])



  const handleSearch = (e) => {
    const value = e.target.value;
    if (value.length > 0) {
      const filtered = collection.filter(item => {
        return new String(item.FULLNAME).toLowerCase().includes(value.toLowerCase()) ||
          new String(item.BILLINGID).toLowerCase().includes(value.toLowerCase())
      })
      setCollections(filtered)
    } else {
      getCollection();
    }
  }




  const handleUpdate = (e, item) => { updateOperations({ billingid: item.BILLINGID, patientid: item.PATIENTID }) }



  return (
    <>
      <Suspense fallback={<div>loading.....</div>}>
        <div>
          <div className="p-2">
            <label>select department</label>
            <select className='form-control mb-2' value={query.queryDept} onChange={(e) => { setQuery({ queryDept: e.target.value, bydept: true }) }}
              disabled={departmentid ? true : false}>
              {
                departments.map((item, index) => { return (<option key={index} value={item.id} >{item.department}</option>) })
              }
            </select>
            <label>filter</label>
            <input
              className="custom-input"
              tabIndex={1}
              onChange={(e) => handleSearch(e)}
              placeholder="search using name or id"
              autoFocus
            />

          </div>
          <ul>
            {collection.length > 0 ? (
              collection.map((item, index) => (
                <li
                  tabIndex={1 + index}
                  onClick={(e) => handleUpdate(e, item)}
                  key={index}
                >
                  {/* <BloodtypeIcon /> */}
                  {item.FULLNAME} - {item.BILLINGID}
                </li>
              ))
            ) : (
              <SECOND_NO_DATA message={"No data"} />
            )}
          </ul>
        </div>
      </Suspense>
    </>
  );
}
