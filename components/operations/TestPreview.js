import React, { useContext, useEffect, useMemo, useState } from 'react';
import OperationsContext from './OperationsContext';
import { useRouter } from 'next/router';
import { customFetch, customPost } from '../Auth/customFetch';
import { Suspense } from 'react';
import { Button } from '@mui/material'
import { ArrowForward } from '@mui/icons-material';
import Link from 'next/link';

export default function TestPreview() {
  const { operationsKey, updateOperations } = useContext(OperationsContext);
  const [datapool, setDatapool] = useState([]);
  const [expandAll, setExpandAll] = useState(false);
  const [active, setActive] = useState(null)

  // use thr billing id of operationsKey to fetch the data from the server
  // and display it in the preview section

  // get departmentid if present from the query of the router
  const { departmentid } = useRouter().query;

  const getPreview = async function () {
    const billingid = operationsKey?.billingid;
    if (operationsKey == null) {
      return
    }
    const response = await customFetch(`operations/test?billingid=${billingid}&&departmentid=${departmentid}`)
    setDatapool(response?.result)
  }



  useMemo(() => getPreview(), [operationsKey])


  const handleClickToggle = (e) => {
    // we want to toggle the display of the child elements ofg the parent element next sibling
    const parent = e.target.parentElement.parentElement;
    const sibling = parent.nextElementSibling;
  }


  const handleProocessing = async function (testid, billingid) {
    try {
      // update the test have started process and bring back data to be replaced in the datapool
      const started = await customPost(`operations/test?testid=${testid}&billingid=${billingid}`, 'PUT', {})

      const { message, statusCode } = started;

      if (statusCode !== 200 && message == 'success') {
        alert("failed to start processing update");
      }
    } catch (err) {
      alert("failed to start processing update");
    }
  }



  const handleResult = async function (testid, billingid, name) {
    // we want to update the context to display test component so that the user can enter the result
    // replace space in the name with underscore
    let testname = (name.replace(/\s/g, '_').toLowerCase());

    if (testname.includes('(') && testname.includes(")")) {
      testname = testname.slice(0, name.indexOf('('))
    }
    updateOperations({ ...operationsKey, testid, billingid, display: true, test: testname })
  }

  return (
    <>
      <Suspense fallback={<div>loading...................</div>}>
        <div className='text-capitalize' id='expand'>
          <input type='checkbox' onChange={() => setExpandAll(!expandAll)} checked={expandAll} />
          expand all
        </div>
        <div >
          {
            datapool.length > 0 ? datapool.map((item, index) => (
              <div key={index} id='operations-test-collection'>
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
                        onClick={() => handleProocessing(item.testid, item.billingid)}
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
              </div>
            )) : <div className='p-2'>
              {
                operationsKey?.billingid != undefined ? (
                  <p className='alert alert-info'><strong>
                    Test probable deleted or updated. kindly visit phelobotomy queue to address that
                    <br></br>
                    <Link href={`/phelobotomy/queue?billingid=${operationsKey?.billingid}`}>
                      <Button variant='contained' color='success' endIcon={<ArrowForward />}>
                        phelobotomy queue
                      </Button>
                    </Link>

                  </strong></p>
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
          }
        </div>
      </Suspense>
    </>
  )
}
