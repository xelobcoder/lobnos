import { useState, useEffect, useMemo } from 'react';
import { Button } from '@mui/material';
import { serverCall, getRecords } from './connector.js';
import Message from '../accessories/message';
import { DeleteForever } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import MARKDOWN_EDITOR from '../accessories/markdownEditor.js';
import Link from 'next/link.js';


function PARAMETER_DISPLAY_COMPONENT({ parameterdata, category, createTarget,testname }) {
  const [mode, setMode] = useState('new');
  const [dataModification, setDataModification] = useState('')
  const [MsgDx, setMsgDx] = useState({
    show: false,
    display: true,
    type: 'error',
    displaytime: '5000',
    width: 'col-12',
    message: ''
  })


  useEffect(() => {
    getRecords(category, setDataModification, parameterdata)
  }, [])



  // listener for changing unit
  const onChangeUnit = (e, index) => {
    setDataModification(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], unit: e.target.value }, ...prevState.slice(index + 1)]
    })
  }
  // listener for changing lower limit
  const onChangeLower = (e, index) => {
    setDataModification(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], lower: parseFloat(e.target.value) }, ...prevState.slice(index + 1)]
    }
    )
  }
  // listener for chnaging upper limit
  const onChangeUpper = (e, index) => {
    setDataModification(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], upper: parseFloat(e.target.value) }, ...prevState.slice(index + 1)]
    }
    )
  }

  const handleView = function () {
    setMsgDx(prevState => {
      return { ...prevState, show: false }
    })

  }


  return (
    <>

      {
        MsgDx.show ?
          <div className='mt-2'>
            <Message props={MsgDx}
              handleView={handleView}
            />
          </div>
          : null
      }
      <div >
        <div className='p-4'>
          <div className='card' style={{ borderRadius: '5px' }}>
            <div className='card-header p-2 d-flex justify-content-between'>
              <div className='d-flex justify-content-start mt-3'>
                <h4 className='btn btn-danger'>{testname}</h4>
              </div>
              <div className='d-flex justify-content-end p-2'>
                <Link href={`/settings/setup/createparam?target=${createTarget}`}>
                  <button className='custom-button'>
                    <AddIcon />
                    create paramater
                  </button>
                </Link>
              </div>
            </div>
            <div className='card-body p-0 m-0'>
              <div className='setup-ul-wrapper '>
                <ul >
                  <li>parameter name</li>
                  <li>unit</li>
                  <li>upper</li>
                  <li>lower</li>
                  <li>action</li>
                </ul>
              </div>
              <div className='setup-ul-wrapper'>
                {
                  dataModification.length == 0 ? null : dataModification.map((item, index) => {
                    return (
                      <ul key={index}>
                        <li>{item.parameter}</li>
                        <li>
                          <input value={item.unit || ''}
                            className='form-control' type='text' onChange={(e) => onChangeUnit(e, index)} />
                        </li>
                        <li>
                          <input value={item.upper || 0} type='number' className='form-control' onChange={(e) => onChangeUpper(e, index)} />
                        </li>
                        <li>
                          <input value={item.lower || 0} type='number' className='form-control' onChange={(e) => onChangeLower(e, index)} />
                        </li>
                        <li>
                          <DeleteForever color='error' sx={{ cursor: 'pointer' }} fontSize='medium' />
                        </li>
                      </ul>
                    )
                  })
                }
              </div>
            </div>
          </div>
          <h4 className='lims-text-color text-capitalize mt-2'>comments</h4>
          <MARKDOWN_EDITOR />
          <div className='fbc_header' style={{ display: "flex", justifyContent: 'right' }} >
            <Button variant='contained' color='success'
              onClick={(ev) => {
                serverCall(ev, dataModification, category, setMsgDx)
              }
              }
            >
              {/* if new entry button dispaly save changes, else update */}
              {
                mode === 'new' ? 'save changes' : 'update changes'
              }
            </Button>
          </div>
        </div>

      </div>
    </>
  )
}



export default PARAMETER_DISPLAY_COMPONENT;