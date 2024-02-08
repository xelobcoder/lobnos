import { useState, useEffect, useCallback } from 'react'
import parameter from  './countparameter'
import { customFetch, customPost } from '../../Auth/customFetch';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import FullBloodCountTable from './FullBloodCount/FbcTable';
import Loader from '../../accessories/Loader';

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
      if (statusCode == 200 && status == 'success' && result.length > 0) {
        setFullcount(result);
      }
      setFullcount([]);
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
    if (isloading) return <Loader />
    else {
      if (fullcount.length == 0) {
        return <div className='alert alert-info opacity-75'>No data found on database. Kindly create paramaters or use default paramaters</div>
      } else {
        return <FullBloodCountTable fullbloodcount={fullcount} setFullcount={setFullcount} />
      }
    }
  }
  return (
    <>
      <ToastContainer />
      <div className='mx-3 my-1'>
        <div >
          <div className='d-flex  justify-content-between my-2'>
            <div className='col-4'>
              <select value={category}
                onChange={(e) => { setCategory(e.target.value) }} className='custom-input'>
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
        <div >
          {renderer()}
          <button className='btn btn-success btn-sm mt-2' onClick={saveData}>
            save data
          </button>
        </div>
      </div>
    </>
  )
}

