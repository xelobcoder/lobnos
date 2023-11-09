import React, { useCallback, useEffect, useState } from 'react'
import MainSettingsLayoutView from '../../components/settingsComponents/MainSettingsLayoutView'
import { AddOutlined, DeleteForever } from '@mui/icons-material'
import Application_Tax_Inclusion from '../../components/settingsComponents/newTaxModal'
import { getDataAndUpdateState } from '../../components/Auth/customFetch';

export default function Application_Taxes_List() {
  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);

  const getdata = useCallback(() => { getDataAndUpdateState(setData, 'application/tax') }, [])

  const hide = () => { setShow(false); }

  useEffect(() => { getdata() }, [getdata])

  return (
    <MainSettingsLayoutView>
      <div className='d-flex justify-content-end mx-2 my-1'>
        <button onClick={(ev) => { setShow(true) }} className='btn btn-secondary'><AddOutlined /> new tax</button>
      </div>
      <div className='mx-2'>
        <button onClick={(ev) => { getdata() }} className=' btn btn-outline-secondary btn-sm'>refresh</button>
        <table className='table'>
          <thead>
            <tr>
              <th>#</th>
              <th>name</th>
              <th>value</th>
              <th>applied</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ?
              (<tr>
                <td colSpan={5}>No data Available</td>
              </tr>
              )
              :
              (<>
                {data.map((item, index) => {
                  return (<tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.value}</td>
                    <td>{item.apply}</td>
                    <td>
                      {/* <button
                        className={`btn btn-sm ${item.apply === 'Yes' ? 'btn-danger' : 'btn-success'}`}
                      >{item.apply === 'Yes' ? 'Deactivate' : 'Activate'}</button> */}
                      <DeleteForever color='error' />
                    </td>
                  </tr>)
                })}
              </>)}
          </tbody>
        </table>
      </div>
      <Application_Tax_Inclusion show={show} hide={hide} />
    </MainSettingsLayoutView>
  )
}
