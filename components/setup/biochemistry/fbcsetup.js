import {Button} from '@mui/material'
import { useState, useEffect } from 'react'
import parameter from  './countparameter'
import { customFetch, customPost } from '../../Auth/customFetch';
import { DeleteForever } from '@mui/icons-material';
import Link from 'next/link';

export default function FullBloodCountSetup() {
  const [fullcount, setFullcount] = useState(parameter)
  const [category, setCategory] = useState('male')
  const [childrenAge, setChildrenAge] = useState('0-10');
  // used for setting paramater to use per category of  data entry
  // if usingdefault is true, we display default params
  const [usingdefault, setUsingDefault] = useState(false);
  const [disable, setDisabled] = useState(true)


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
      <div className='mx-3 my-1'>
        <div >
          <div className='d-flex  justify-content-between my-2'>
            <div className='col-4'>
            <select value={category} onChange={(e) => { setCategory(e.target.value) }} className='custom-input'>
                <option value=''>select category</option>
              <option value='male'>male</option>
              <option value='female'>female</option>
              <option value='children'>children</option>
            </select>
            </div>
            <div className='d-flex '>
            <Link href={'/settings/setup/createparam?target=fbc'}>
              <button className='btn btn-primary btn-sm mx-1' >
                create parameter
              </button>
            </Link>

            <button className='btn btn-primary btn-sm mx-1' sx={{ padding: '0px 10px', margin: '0px 10px' }}
              onClick={() => setUsingDefault(true)}>
              default params
            </button>
            <button className='btn btn-primary btn-sm mx-1' sx={{ padding: '0px 10px', margin: '0px 10px' }}
              onClick={() => setUsingDefault(false)}>
               table params
            </button>
            <button className='btn btn-primary btn-sm mx-1' onClick={handleCreatedParamsView}>
              created params
            </button>
          </div >
            <h6  className='text-capitalize bg-secondary text-white'> children age range: {childrenAge}</h6>
          </div>
        </div>
        {/* parameter section */}
        <div className='wrapperx'>
          <table className='billing-cart-table'>
            <thead>
              <tr>
                <th>parameter name</th>
                <th>unit</th>
                <th>upper</th>
                <th>lower</th>
                <th>action </th>
              </tr>
            </thead>
            <tbody>
              {
                  fullcount.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{item.PARAMETER}</td>
                        <td>
                          <input className='form-control' value={item.UNIT} type='text' onChange={(e) => onChangeUnit(e, index)} />
                        </td>
                        <td>
                          <input className='form-control' value={item.UPPER} type='number' onChange={(e) => onChangeUpper(e, index)} />
                        </td>
                        <td>
                          <input className='form-control' value={item.LOWER} type='number' onChange={(e) => onChangeLower(e, index)} />
                        </td>
                        <td>
                          <DeleteForever color='error' onCtdck={() => handleDelete(item)} />
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
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

