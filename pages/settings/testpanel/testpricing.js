import React, { useState, useEffect } from 'react'
import { customFetch, getSampleTypeList, validateFormData } from '../../../components/Auth/customFetch'
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';


export default function TESTPRICING() {
  const [panel, setPanel] = useState([]);
  const [dept, setDept] = useState([]);
  const [sampleType, setSampleType] = useState([])

  // get the test list
  const getTestList = async function () {
    const getResponse = await customFetch('testpanel/list/bulk');
    const { data, statusCode, status } = getResponse;
    if (status == 'success' && statusCode == 200) {
      setPanel(data)
    }
  }


  const getDeptments = async function () {
    const getDept = await customFetch('departments');
    const { data, statusCode, status } = getDept;
    if (status == 'success' && statusCode == 200) {
      setDept(data)
    }
  }




  const handleTestListChange = (ev, index, item) => {
    setPanel((prev) => {
      const mappedFiltered = prev[index]
      mappedFiltered[item] = ev.target.value;
      prev[index] = mappedFiltered;
      return [...prev]
    })
  }


  const updatePanelList = async function () {
    const getResponseData = async function (data) {
      const { status, statusCode, message } = data;
      if (status == 'success' && statusCode == 201) {
        alert(message);
        getSampleTypeList(setSampleType);
      }
    }
    await validateFormData({ panel }, true, [], 'testpanel/bulkupdate', getResponseData, getTestList())
  }

  useEffect(() => {
    getTestList()
    getDeptments()
    getSampleTypeList(setSampleType)
  }, [])


  return (
    <MainSettingsLayoutView>
      <div className='container-fluid bg-white p-2' style={{height:'100vh',overflowY:'auto'}}>
        <table className='table'>
          <thead className='striped'>
            <tr>
              <th>NAME</th>
              <th>CATEGORY</th>
              <th>SAMPLE TYPE</th>
              <th>UNIT</th>
              <th>QTY</th>
              <th>PRICE</th>
            </tr>
          </thead>
          <tbody>
            {panel.map((item, index) => {
              return (
                <tr key={index}>
                  <td className='text-capitalize text-success'>{item.NAME}</td>
                  <td>
                    <select onChange={(e) => handleTestListChange(e, index, 'CATEGORY')} value={item.CATEGORY}>
                      <option>select category</option>
                      {
                        dept.map((d, ii) => {
                          return (
                            <option key={ii} value={d.id}>
                              {d.department}
                            </option>)
                        })
                      }
                    </select>
                  </td>
                  <td>
                    <select  value={item.SAMPLE} onChange={(e) => handleTestListChange(e, index, 'SAMPLE')}>
                      {
                        sampleType.map((s, ie) => {
                          return (
                            <option key={ie} value={s.id}>
                              {s.name}
                            </option>
                          )
                        })
                      }
                    </select>
                  </td>
                  <td>
                    <input value={item.UNIT} />
                  </td>
                  <td>
                    <input value={item.QTY_REQUIRED} onChange={(e) => handleTestListChange(e, index, 'QTY_REQUIRED')} />
                  </td>
                  <td>
                    <input value={item.PRICE}
                      onChange={(e) => handleTestListChange(e, index, 'PRICE')} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <button className='btn btn-outline-danger' onClick={updatePanelList}>
          update changes
        </button>
      </div>
    </MainSettingsLayoutView>
  )
}
