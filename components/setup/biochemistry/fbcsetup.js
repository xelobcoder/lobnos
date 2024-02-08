import { useState, useEffect, useCallback } from 'react'
import parameter from  './countparameter'
import { customFetch, customPost } from '../../Auth/customFetch';
import { onChangeUnit, onChangeLower, onChangeUpper } from '../../LabTestForms/utilsetup';
import { DeleteForever } from '@mui/icons-material';
import Loader from '../../accessories/Loader';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';

export default function FullBloodCountSetup() {
  const [fullcount, setFullcount] = useState(parameter)
  const [category, setCategory] = useState('male')
  const [childrenAge, setChildrenAge] = useState('0-10');
  const [isloading, setLoading] = useState(true);


  const setDefaultParams = () => { setFullcount(parameter) }
  

  const getFullCountData = useCallback(async function () {
    try {
      setLoading(true);
      const response = await customFetch(`test/setup/fbc?category=${category}`);
      const { result, statusCode, status } = response;
      if (statusCode == 200 && status == 'success') {
        setFullcount(result);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setFullcount([]);
    }
  }, [category]);


  useEffect(() => {
    getFullCountData()
  }, [getFullCountData])



  const getCreatedParams = async function (e) {
    customFetch(`test/setup/fbc/createparams`)
      .then((data) => setFullcount(data?.data))
      .catch((err) => setFullcount([]))
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


  const renderer = () => {
    if (isloading) {
      return (
        <tbody>
          <tr>
            <td>Data not found</td>
          </tr>
        </tbody>
      )
    }
    else {
      return (
        <tbody>
          {
            fullcount.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{index + 1}. {" "}{item.parameter}</td>
                  <td>
                    <input className='custom-input' value={item.unit} type='text' onChange={(e) => onChangeUnit(e, index, setFullcount)} />
                  </td>
                  <td>
                    <input className='custom-input' value={item.upper} type='number' onChange={(e) => onChangeUpper(e, index, setFullcount)} />
                  </td>
                  <td>
                    <input className='custom-input' value={item.lower} type='number' onChange={(e) => onChangeLower(e, index, setFullcount)} />
                  </td>
                  <td>
                    <DeleteForever color='error' onCtdck={() => handleDelete(item)} />
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      )
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
            <h6 className='text-capitalize bg-secondary text-white text-sm d-flex justify-content-center align-content-center p-1'> children age range: {childrenAge}</h6>
          </div>
        </div>
        <div className='wrapperx'>
          <table className='table'>
            <thead>
              <tr>
                <th>parameter name</th>
                <th>unit</th>
                <th>upper</th>
                <th>lower</th>
                <th>action </th>
              </tr>
            </thead>
            {renderer()}
          </table>
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

