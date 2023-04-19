import React, { useContext, useMemo, useState } from 'react';
import OperationsContext from './OperationsContext';
import { customFetch } from '../Auth/customFetch';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Suspense } from 'react';

export default function TestPreview() {
  const { operationsKey, updateOperations } = useContext(OperationsContext);
  const [datapool, setDatapool] = useState([]);
  const [expandAll, setExpandAll] = useState(false);

  // use thr billing id of operationsKey to fetch the data from the server
  // and display it in the preview section

  console.log(operationsKey, 'hekk')

  const getPreview = async function () {
    const billingid = operationsKey?.billingid;
    if (operationsKey == null) {
      return
    }
    const response = await customFetch(`operations/test?billingid=${billingid}`)
    setDatapool(response?.result)
  }

  useMemo(() => getPreview(), [operationsKey])


  const handleClickToggle = (e) => {
    // we want to toggle the display of the child elements ofg the parent element next sibling
    const parent = e.target.parentElement.parentElement;
    const sibling = parent.nextElementSibling;
  }


  const handleProocessing = async function (testid, billingid) {
    // update the test have started process and bring back data to be replaced in the datapool
    const started = await (await fetch(`${process.env.BASEURL}/operations/test?testid=${testid}&billingid=${billingid}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
      }
    })
    ).json();


    const { result, status } = started;

    if (status == 400) { alert('failed to start processing update') }

  }



  const handleResult = async function (testid, billingid,name) {
    // we want to update the context to display test component so that the user can enter the result
    // replace space in the name with underscore
    const testname = (name.replace(/\s/g, '_').toLowerCase())
    updateOperations({ ...operationsKey,testid, billingid, display: true,test:testname})
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
            datapool.map((item, index) => (
              <div key={index} id='operations-test-collection'>
                <div className='firstchild'>
                  <div>{item.NAME}</div>
                </div>
                {
                  expandAll && (
                    <div className='buttons'>
                      <button className={
                        item.processing == 'true' ? 'bg-custom-default' : 'bg-custom-red'
                      }
                        onClick={() => handleProocessing(item.testid, item.billingid)}
                      >
                        start processing
                      </button>
                      <button className='bg-custom-red'
                        onClick={() => handleResult(item.testid, item.billingid,item.NAME)}>
                        result
                      </button>
                    </div>
                  )
                }
              </div>
            ))
          }
        </div>
      </Suspense>
    </>
  )
}
