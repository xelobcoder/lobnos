import React, { useEffect, useState } from 'react'
import TestPanelLayout from '../../../components/testpanel/TestPanelLayout'
import { Check, Delete } from '@mui/icons-material'
import { customFetch, customPost, getSampleTypeList } from '../../../components/Auth/customFetch';

export default function Sampletypes() {
  const [sampletype, setSample] = useState('urine');
  const [source, setSource] = useState([])


  const addList = async function () {
    if (sampletype) {
      const postRequest = await customPost('sampletype', 'POST', { name: sampletype });
      const { statusCode, status, message } = postRequest;
      if (statusCode == 201 && status == 'success') {
        alert(message);
        getSampleTypeList(setSource)
      }
    }
  }


  

  const deleteSpecific = async function (id) {
    const deleteItem = await customPost(`sampletype?id=${id}`, 'DELETE', {})
    const { message, statusCode, status } = deleteItem;
    if (statusCode == 200 && status == 'success') {
      alert(message)
      getSampleTypeList(setSource)
    }
  }


  useEffect(() => {
    getSampleTypeList(setSource)
  }, [])

  return (
    <>
      <TestPanelLayout>
        <div className='container-fluid p-3'>
          <div className='container p-3 bg-white   br-5 '>
            <div className='d-flex justify-content-between'>
              <div className='col-10'>
                <input className='form-control'
                  onChange={(e) => setSample(e.target.value)}
                  value={sampletype} placeholder='Add sample type' />
              </div>
              <div className='col-1'>
                <button onClick={addList} className='btn btn-success'>add sample</button>
              </div>
            </div>
            <table className='mt-2 table border pointer'>
              <thead className='bordered table-light br-7 text-capitalize'>
                <tr>
                  <th>#</th>
                  <th>name</th>
                  <th>action</th>
                </tr>
              </thead>
              <tbody>
                {
                  source.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>
                          <Delete onClick={() => deleteSpecific(item.id)} color='error' />
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </TestPanelLayout>
    </>
  )
}
