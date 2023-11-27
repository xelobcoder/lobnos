import {Button} from '@mui/material'
import { useState, useEffect, useCallback } from 'react'
import parameter from  './countparameter'
import { customFetch, customPost, getDataAndUpdateState } from '../../Auth/customFetch';
import { DeleteForever } from '@mui/icons-material';
import ISLOADING from '../../isLoading';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';

export default function FullBloodCountSetup() {
  const [fullcount, setFullcount] = useState(parameter)
  const [category, setCategory] = useState('male')
  const [childrenAge, setChildrenAge] = useState('0-10');
  const [loading, setLoading] = useState(true);


  const onChangeUnit = (e, index) => {
    setFullcount(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], unit: e.target.value }, ...prevState.slice(index + 1)]
    })
  }
  const onChangeLower = (e, index) => {
    setFullcount(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], lower: e.target.value }, ...prevState.slice(index + 1)]
    }
    )
  }
  const onChangeUpper = (e, index) => {
    setFullcount(prevState => {
      return [...prevState.slice(0, index), { ...prevState[index], upper: e.target.value }, ...prevState.slice(index + 1)]
    }
    )
  }


  const setDefaultParams = () => { setFullcount(parameter) }

  const getFullCountData = useCallback(async function () {
    setLoading(true);
    const response = await customFetch(`test/setup/fbc?category=${category}`);
    const { result, statusCode, status } = response;
    if (statusCode == 200 && status == 'success') {
      setFullcount(result);
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { getFullCountData() }, [category, getFullCountData])



  const getCreatedParams = async function (e) {
    const response = await customFetch(`test/setup/fbc/createparams`);
    response?.data && setFullcount(response.data)
  }

  const saveData = async function (e) {
    const pushdata = await customPost(`test/setup/fbc`, 'POST', { setupdata: fullcount, setup: 'FBC', category })
    const { status, message, statusCode } = pushdata;
    if (statusCode == 200 && status == 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }


  return (
    <>
      <ToastContainer />
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
                onClick={() => { setDefaultParams() }}>
              default params
            </button>
            <button className='btn btn-primary btn-sm mx-1' sx={{ padding: '0px 10px', margin: '0px 10px' }}
                onClick={() => { getFullCountData() }}>
               table params
            </button>
              <button className='btn btn-primary btn-sm mx-1' onClick={getCreatedParams}>
              created params
            </button>
          </div >
            <h6  className='text-capitalize bg-secondary text-white'> children age range: {childrenAge}</h6>
          </div>
        </div>
        {/* parameter section */}
        <div className='wrapperx'>
          {!loading && (
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
                {(fullcount.length > 0) ? fullcount.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.parameter}</td>
                      <td>
                        <input className='form-control' value={item.unit} type='text' onChange={(e) => onChangeUnit(e, index)} />
                      </td>
                      <td>
                        <input className='form-control' value={item.upper} type='number' onChange={(e) => onChangeUpper(e, index)} />
                      </td>
                      <td>
                        <input className='form-control' value={item.lower} type='number' onChange={(e) => onChangeLower(e, index)} />
                      </td>
                      <td>
                        <DeleteForever color='error' onCtdck={() => handleDelete(item)} />
                      </td>
                    </tr>
                  )
                }) : <tr><td colSpan='5' className='text-center'>no data</td></tr>}
              </tbody>
            </table>
          )}
          {loading && (<ISLOADING />)}
        </div>
        <div >
          <button className='btn btn-success btn-sm mt-2' onClick={saveData}>
            save data
          </button>
        </div>
      </div>
    </>
  )
}

