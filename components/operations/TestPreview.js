import React, { useContext, useMemo, useState } from 'react';
import OperationsContext from './OperationsContext';
import { customFetch } from '../Auth/customFetch';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Suspense } from 'react';

export default function TestPreview() {
  const { operationsKey, updateOperations } = useContext(OperationsContext);
  const [datapool, setDatapool] = useState([]);
  const [expandAll, setExpandAll] = useState(false);
  const [active, setActive] = useState(null)

  // use thr billing id of operationsKey to fetch the data from the server
  // and display it in the preview section


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
    try {
      // update the test have started process and bring back data to be replaced in the datapool
      const started = await (
        await fetch(
          `${process.env.BASEURL}/operations/test?testid=${testid}&billingid=${billingid}`,
          {
            method: "PUT",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
            },
          }
        )
      ).json();

      const { result, status } = started;

      if (status == 400) {
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
            datapool.map((item, index) => (
              <div key={index} id='operations-test-collection'>
                <div className='firstchild'>
                  <div onClick={(e) => setActive(index)}>{item.NAME}</div>
                </div>
                {
                  (active == index || expandAll == true) && (
                    <div className='buttons'>
                      <button className={
                        item.processing == 'true' ? 'bg-custom-default' : 'bg-custom-red'
                      }
                        disabled={item.processing == 'true' ? true : false}
                        onClick={() => handleProocessing(item.testid, item.billingid)}
                        title={item.processing == 'true' ? 'item already procesing hence button disabled' : 'click to start processing sample'}
                      >
                        start processing
                      </button>
                      <button
                        className={
                          item.ready == 'true' ? 'bg-custom-default' : 'bg-custom-red'
                        }
                        onClick={() => handleResult(item.testid, item.billingid, item.NAME)}>
                        result
                      </button >
                      {
                        item.ready == 'true' ? (
                          <button className='custom-button'>
                            preview
                          </button>
                        ) : null
                      }
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
