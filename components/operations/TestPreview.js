import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import OperationsContext from './OperationsContext';
import { useRouter } from 'next/router';
import { customFetch, customPost } from '../Auth/customFetch';
import { Form } from 'react-bootstrap';

export default function TestPreview() {
  const { operationsKey, updateOperations } = useContext(OperationsContext);
  const [datapool, setDatapool] = useState([]);
  const [expandAll, setExpandAll] = useState(false);
  const [active, setActive] = useState(null);
  const billingid = operationsKey?.billingid;

  // use the billing id of operationsKey to fetch the data from the server
  // and display it in the preview section

  // get departmentid if present from the query of the router
  const { departmentid } = useRouter().query;

  const getPreview = useCallback(async function () {
    if (!billingid || !departmentid) return;
    const response = await customFetch(`operations/test?billingid=${billingid}&&departmentid=${departmentid}`)
    setDatapool(response?.result)
  }, [billingid, departmentid])



  useEffect(() => { getPreview(); console.log('uu') }, [getPreview])


  const handleProocessing = async function (item) {
    try {
      const { billingid, testid } = item;
      if (!billingid || !testid) return;
      // update the test have started process and bring back data to be replaced in the datapool
      const started = await customPost(`operations/test/initiateprocessing?testid=${testid}&billingid=${billingid}`, 'PUT', {});
      const { status } = started;
      if (status && status == 'success') {
        const data = [...datapool];
        const oldIndex = data.findIndex((item, index) => item.testid == testid);
        console.log(oldIndex)
        data[oldIndex]['processing'] = 'true';
        setDatapool(data)
      }
    } catch (err) {
      alert("failed to start processing update");
    }
  }



  const handleResult = async function (testid, billingid, name) {
    let testname = (name.replace(/\s/g, '_').toLowerCase());
    if (testname.includes('(') && testname.includes(")")) {
      testname = testname.slice(0, name.indexOf('('))
    }
    updateOperations({ ...operationsKey, testid, billingid, display: true, test: testname })
  }



  const renderingView = () => {
    if (datapool.length == 0) {
      return (
        <div className='p-2'>
          {operationsKey?.billingid != undefined ? (
            <p className='alert alert-info opacity-50'>
              <strong>
                No data Available please!!!
              </strong>
            </p>
          ) :
            (<div>
              <div className='p-2 alert alert-info'>
                <strong >
                  <h6>select a client on the left side panel to continue</h6>
                </strong>
              </div>
            </div>)
          }
        </div>
      )
    } else {
      return (
        <div>
          {datapool.map((item, index) => {
            return (<div key={index} id='operations-test-collection'>
              <div className='firstchild'>
                <div onClick={(e) => setActive(index)}>{item.NAME}</div>
              </div>
              {
                (active == index || expandAll == true) && (
                  <div className='buttons'>
                    <button
                      style={{ textTransform: 'lowercase', height: '40px' }}
                      className={
                        item.processing == 'true' ? 'btn btn-success btn-sm' : 'btn btn-danger btn-sm mx-1'
                      }
                      disabled={item.processing == 'true' ? true : false}
                      onClick={() => handleProocessing(item)}
                      title={item.processing == 'true' ? 'item already procesing hence button disabled' : 'click to start processing sample'}
                    >
                      processing
                    </button>
                    <button
                      style={{ textTransform: 'lowercase', height: '40px' }}
                      className={
                        item.ready == 'true' ? 'btn btn-success btn-sm' : 'btn btn-danger btn-sm mx-1'
                      }
                      onClick={() => handleResult(item.testid, item.billingid, item.NAME)}>
                      result
                    </button >
                    {
                      item.ready == 'true' && (<button
                        style={{ textTransform: 'lowercase', height: '40px' }}
                        className='btn btn-success btn-sm'>
                        preview
                      </button>)
                    }
                  </div>
                )
              }
            </div>)
          })}
        </div>
      )
    }
  }

  return (
    <>
      <div className='text-capitalize d-flex justify-content-between' id='expand'>
        <span className='mt-2'> Toggle to expand test</span>
        <Form.Switch onChange={(ev) => { setExpandAll(ev.target.checked) }} style={{ fontSize: '25px' }} />
      </div>
      <div >
        {renderingView()}
      </div>
    </>
  )
}
