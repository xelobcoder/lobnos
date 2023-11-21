import React, { useContext, useEffect, useState } from 'react';
import { customFetch, printResultNavigator } from '../Auth/customFetch';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import OperationsContext from './OperationsContext'

export default function AllresultSecondPanel() {
  const { operationsKey, updateOperations } = useContext(OperationsContext);
  const [expandAll, setExpandAll] = useState(false);
  const [datapool, setDatapool] = useState([]);
  const [active, setActive] = useState(null);
  const navigator = useRouter();


  const getPreview = async function () {
    const billingid = operationsKey?.billingid;
    if (operationsKey == null) { return}
    const response = await customFetch(`operations/test/result?billingid=${billingid}`)
    setDatapool(response?.result)
  }


  useEffect(() => {
    getPreview();
  }, [operationsKey])


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
      <div className='text-capitalize' id='expand'>
        <input type='checkbox' onChange={() => setExpandAll(!expandAll)} checked={expandAll} />
        expand all
      </div>
      <div>
        {
          datapool.length > 0 ? datapool.map((item, index) => (
            <div key={index} id='operations-test-collection'>
              <div className='firstchild'>
                <div onClick={(e) => setActive(index)}>{item.NAME}</div>
              </div>
              {
                (active == index || expandAll == true) && (
                  <div className='px-2'>
                    <button
                      className={
                        item.ready == 'true' ? 'btn btn-success btn-sm' : 'btn btn-danger btn-sm'
                      }
                      onClick={() => handleResult(item.testid, item.billingid, item.NAME)}>
                      result
                    </button >
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
    </>
  )
}
