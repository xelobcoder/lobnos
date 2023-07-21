import {Button} from '@mui/material'
import { useState, useCallback, useEffect, Suspense } from 'react'
import parameter from './hematology/countparameter';
import { customFetch, customPost } from '../../Auth/customFetch';
import { DeleteForever } from '@mui/icons-material';
import Link from 'next/link';

function FullBloodCountSetup() {
  const [fullcount, setFullcount] = useState(parameter)
  const [category, setCategory] = useState('male')
  const [childrenAge, setChildrenAge] = useState('0-10');
  // used for setting paramater to use per category of  data entry
  const [usingdefault, setUsingDefault] = useState(false);
  const [disable, setDisabled] = useState(true)
  const [mode, setmode] = useState('new')

  const onChangeUnit = (e, index) => {
    setFullcount(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], UNIT: e.target.value }, ...prevState.slice(index + 1)]
    })
  }
  const onChangeLower = (e, index) => {
    setFullcount(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], LOWER: e.target.value }, ...prevState.slice(index + 1)]
    }
    )
  }
  const onChangeUpper = (e, index) => {
    setFullcount(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], UPPER: e.target.value }, ...prevState.slice(index + 1)]
    }
    )
  }


  const saveData = async function (e) {
    const pushdata = await customPost(`test/setup/fbc`, 'POST', {
      setupdata: fullcount, setup: 'FBC', category
    })
  }



  const getdata = async function () {
    let response = await customFetch(`test/setup/fbc?category=${category}`);
    Array.isArray(response) && setFullcount(response)
  }
  // select options for savin g data im terms of male,female,children
  useEffect(() => {
    if (category) {
      getdata();
    }
  }, [category])


  // this monitor for changes made to useDefault category


  useEffect(() => {
    usingdefault ? setFullcount(parameter) : getdata();
  }, [usingdefault])




  // this handle delete of a parameter

  const handleDelete = async function (e) {
    const { FBCID, PARAMETER, UNIT, LOWER, UPPER } = e;

    // using fbcid to delte data
    const response = await customPost(`test/setup/fbc?category=${category}&&id=${FBCID}`, 'DELETE', {});

    const { status, message, statusCode } = response;

    if (status == 'success' && statusCode == 200) {
      alert(message)
      getdata()
    }
    else {
      alert(response?.message)
    }
  }

  const handleCreatedParamsView = async function (e) {
     const response = await customFetch(`test/setup/fbc/createparams`);
     response?.data && setFullcount(response.data)
  }



  return (
    <>
      <div className='_fbc'>
        <Link href='/instructions/setup/fullbloodcount'>
          Read Instructions
        </Link>

        <div className='top_cart'>
          <div className='form-group'>
            <label>category</label>
            <select value={category} onChange={(e) => { setCategory(e.target.value) }} className='custom-input'>
              <option value='male'>male</option>
              <option value='female'>female</option>
              <option value='children'>children</option>
            </select>
          </div>
          <div className='form-group'>
            <label>children range</label>
            <input className='custom-input' value={childrenAge} disabled={disable}></input>
          </div>
          <div className='form-group d-flex'>

            <Link href={'/settings/setup/createparam?target=fbc'}>
              <Button variant='contained' >
                create parameter
              </Button>
            </Link>

            <Button variant='contained' sx={{padding:'0px 20px',margin:'0px 10px'}}
              onClick={() => setUsingDefault(!usingdefault)}>
              {usingdefault === true ? 'table params' : 'use default'}
            </Button>
            <Button variant='contained' onClick={handleCreatedParamsView}>
              view created params
            </Button>
          </div>
        </div>
        {/* parameter section */}
        <div className='wrapperx'>
          <div className='fbc_header'>
            <ul>
              <li>parameter name</li>
              <li>unit</li>
              <li>upper</li>
              <li>lower</li>
              <li>action </li>
            </ul>
          </div>
          <div className='fbc_header'>
            <div className='parameter-list'>
              <Suspense fallback={<div>loading ................</div>}>
                {
                  fullcount.map((item, index) => {
                    return (
                      <ul key={index}>
                        <li>{item.PARAMETER}</li>
                        <li>
                          <input value={item.UNIT} type='text' onChange={(e) => onChangeUnit(e, index)} />
                        </li>
                        <li>
                          <input value={item.UPPER} type='number' onChange={(e) => onChangeUpper(e, index)} />
                        </li>
                        <li>
                          <input value={item.LOWER} type='number' onChange={(e) => onChangeLower(e, index)} />
                        </li>
                        <li>
                          <DeleteForever color='error' onClick={() => handleDelete(item)} />
                        </li>
                      </ul>
                    )
                  })
                }
              </Suspense>
            </div>
          </div>
        </div>
        <div >
          <Button variant='contained' color='success' className='mt-2' onClick={saveData}>
            save changes
          </Button>
        </div>
      </div>
    </>
  )
}

export default FullBloodCountSetup
