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




  const handleTestListChange = (ev, index, item,sampleid) => {
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
    getTestList();
    getDeptments();
    getSampleTypeList(setSampleType);
  }, [])


  return (
    <MainSettingsLayoutView>
      <div className='container-fluid bg-white p-2' >
        <table className='table'>
          <thead>
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
                  <td className='text-capitalize text-success'>{item.name}</td>
                  <td>
                    <select  className='custom-select'  onChange={(e) => handleTestListChange(e, index, 'category')} value={item.category}>
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
                    <select  value={item.SAMPLE} className='custom-select' onChange={(e) => handleTestListChange(e, index, 'sample')}>
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
                    <input className='custom-input' value={item.unit} onChange={(ev) => handleTestListChange(ev,index,'unit')} />
                  </td>
                  <td>
                    <input value={item.qty_required} className='custom-input' onChange={(e) => handleTestListChange(e, index, 'qty_required')} />
                  </td>
                  <td>
                    <input className='custom-input' value={item.price}
                      onChange={(e) => handleTestListChange(e, index, 'price')} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <button className='btn btn-outline-danger fw-bold my-3 btn-sm' onClick={updatePanelList}>
          update changes
        </button>
      </div>
    </MainSettingsLayoutView>
  )
}
