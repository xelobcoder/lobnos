import React, { useState, useEffect } from 'react'
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout'
import esrparams from '../../../components/setup/biochemistry/esrparams';
import { ToastContainer,toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import { getSetupRecords, serverCall } from '../../../components/setup/connector';
import ISLOADING from '../../../components/isLoading';
const  MARKDOWN_EDITOR = dynamic(  () => import('../../../components/accessories/markdownEditor'), { ssr: false })

export default function ESR() {
  const [range, setRange] = useState(esrparams);
  const [loading, setLoading] = useState(true);
  const [useDefault, setUsingDefault] = useState(false);
  const [literature, setLiterature] = useState('');


  const onChangeValue = async function (e, index, target) {
    setRange((prevState) => {
      const newRange = [...prevState]
      newRange[index] = { ...newRange[index], [target]: e.target.value };
      return newRange;
    });
  };

  const pushResult = async function (event) {
    await serverCall(event, range, literature, 'esr', toast);
  };


  useEffect(() => {
    getSetupRecords('esr', setRange, esrparams, setLoading, setUsingDefault,setLiterature);
  }, [])

  const updateLiterature = (event,data) => { setLiterature(data)}
  return (
    <div>
      <CHEMISTRY_LAYOUT_SETUP>
        <ToastContainer/>
        <form>
          <div className='mx-2 my-2' >
            <div className='card'>
              <div className='card-header bg-secondary text-white text-capitalize'>
              <h5>Erthyrocyte sedimentation rate</h5>
              </div>
              <div className='card-body'>
                {loading && <ISLOADING />}
                {(!loading && range.length > 0)
                  ? (
                <>
                  <table className='table'>
                  <thead>
                    <tr>
                      <th>gender</th>
                      <th>agelimit</th>
                      <th>lower</th>
                      <th>upper</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      range.length == 0 ? <h6 className='d-flex justify-content-center'>No Data Found</h6>: (
                        range.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{item.gender}</td>
                              <td>{item.agelimit}</td>
                              <td>
                                <input
                                  className='custom-input'
                                  placeholder="lower"
                                  step={1}
                                  minLength={0}
                                  inputMode="numeric"
                                  type="number"
                                  value={item.lower}
                                  name='lower'
                                  onChange={(e) => onChangeValue(e, index, 'lower')}
                                />
                              </td>
                              <td>
                                <input
                                  placeholder="higher"
                                  step={1}
                                  className='custom-input'
                                  value={item.upper}
                                  name='upper'
                                  onChange={(e) => onChangeValue(e, index, 'upper')}
                                  minLength={0}
                                />
                              </td>
                            </tr>
                          )
                        })
                      )
                    }
                  </tbody>
                </table> 
                <div className='my-3'>
                  <MARKDOWN_EDITOR initialData={literature} updatedata={updateLiterature} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type='button' className='btn btn-primary btn-sm mt-4' onClick={pushResult}>save changes</button>
                </div>
                    </>
                ): (<h4>No data Available</h4>)}
              </div>
            </div>
           
          </div>
        </form>
      </CHEMISTRY_LAYOUT_SETUP>
    </div>
  );
}
