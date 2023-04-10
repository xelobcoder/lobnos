import React, { useState, useMemo, Suspense, useContext } from 'react';
import { customFetch } from '../Auth/customFetch';
import OperationsContext from './OperationsContext';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';

export default function OperationsTestCollection() {
  const { operationsKey ,updateOperations} = useContext(OperationsContext)
  const [collection, setCollections] = useState([]);


  // intial data fetching from the server
  const getCollection = async function () {
    const response = await customFetch('operations/collection')
    setCollections(response?.result)
  }

  useMemo(() => getCollection(), [])

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value.length > 0) {
      const filtered = collection.filter(item => {
        return new String(item.FULLNAME).toLowerCase().includes(value.toLowerCase()) || 
        new String(item.PATIENTID).toLowerCase().includes(value.toLowerCase())
      })
      setCollections(filtered)
    } else {
      getCollection();
    }
  }


  const handleUpdate = (e,item) => { updateOperations({ billingid:item.BILLINGID })}




  return (
    <>
      <Suspense fallback={<div>loading.....</div>}>
        <div>
          <div className='p-2'>
            <input className='custom-input' tabIndex={1} onChange={(e) => handleSearch(e)} placeholder='search using name or id'  autoFocus/>
          </div>
          <ul>
            {collection.map((item, index) => (
              <li tabIndex={1+index} onClick={(e) => handleUpdate(e,item)} key={index}><BloodtypeIcon/>{item.PATIENTID} : {item.FULLNAME}</li>
            ))}
          </ul>
        </div>
      </Suspense >
    </>
  )
}
