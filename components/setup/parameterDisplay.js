import { useState, useEffect } from 'react';
import { serverCall, getSetupRecords, handleDeleteParams } from './connector.js';
import { DeleteForever } from '@mui/icons-material';
import dynamic from 'next/dynamic';
const  MARKDOWN_EDITOR = dynamic(  () => import('../accessories/markdownEditor.js'), { ssr: false })
import Link from 'next/link.js';
import { ToastContainer, toast } from 'react-toastify';
import ISLOADING from '../isLoading.js';


function PARAMETER_DISPLAY_COMPONENT({ parameterdata, testname,gender }) {
  const [mode, setMode] = useState('new');
  const [dataModification, setDataModification] = useState('');
  const [linksrc, setLinksrc] = useState(`/settings/setup/createparam?target=${testname}`);
  const [literature, setLiterature] = useState('');
  const [loading, setLoading] = useState(true);
  const [usingDefault,setUsingDefault] = useState(false);

  const updateLiterature = async function (event, data) { setLiterature(data) };

  useEffect(() => {
    getSetupRecords(testname, setDataModification, parameterdata,setLoading,setUsingDefault,setLiterature)
  }, [])


  useEffect(() => {
    if (gender || gender == 'true') { setLinksrc(linksrc + '&gender=true') } else { setLinksrc(linksrc + '&gender=false') }
  },[])

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
    })
  }



  return (
    <>
      <ToastContainer/>
      <div >
        <div className='py-2 px-2'>
          <div className='card br-5 m-0'>
            <div className='card-header bg-secondary text-white d-flex justify-content-between'>
            <h4 className='text-capitalize'>
                  {testname.split("_").join(" ") || ''}
              </h4>
             {usingDefault && ( <div>
              <span className='badge bg-info'>using default parameter</span>
           </div>)}
              <Link href={linksrc}>
                <button className='btn btn-primary btn-sm'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z" />
                  </svg>
                    create paramater
                  </button>
              </Link>
            </div>
            <div className='card-body'>
              {loading && <ISLOADING />}
              {!loading && (
                <>
                  <table className='table'>
                    <thead>
                      <tr>
                        <th>parameter name</th>
                        <th>unit</th>
                        <th>upper</th>
                        <th>lower</th>
                        {dataModification.length > 0 && dataModification[0]['gender'] ? <th>gender</th> : null}
                        <th>action</th>
                </tr>
              </thead>
              <tbody>
                {
                  dataModification.length == 0 ? null : dataModification.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}.{item.parameter}</td>
                        <td>
                          <input value={item.unit || ''}
                            className='custom-input' type='text' onChange={(e) => onChangeUnit(e, index)} />
                        </td>
                        <td>
                          <input
                            value={item.upper || 0}
                            type='number' min={0}
                            required className='custom-input'
                            onChange={(e) => onChangeUpper(e, index)} />
                        </td>
                        <td>
                          <input value={item.lower || 0}
                            type='number' required min={0}
                            className='custom-input'
                            onChange={(e) => onChangeLower(e, index)} />
                        </td>
                        {
                          item?.gender && <td>{item.gender}</td>
                        }
                        <td>
                          <button className='btn btn-danger btn-sm p-0'
                            onClick={(ev) => {
                              handleDeleteParams(ev, item, toast, testname, {
                                l: setLoading,
                                d: setDataModification,
                                ds: parameterdata,
                                loading: setLoading,
                                literature: setLiterature
                              })
                            }}>
                            <DeleteForever color='white' sx={{ cursor: 'pointer' }} fontSize='medium' />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
              </table>
              <div className='my-3'>
                  <h4 className='lims-text-color text-capitalize'>literature</h4>
                  <MARKDOWN_EDITOR updatedata={updateLiterature} initialData={literature} />
                  <button className='btn btn-primary btn-sm my-3'
                    onClick={(ev) => { serverCall(ev, dataModification,literature, testname,toast) }}>
                    {mode === 'new' ? 'save changes' : 'update changes'}
                  </button>
             </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}



export default PARAMETER_DISPLAY_COMPONENT;