import { DeleteOutlineTwoTone } from '@mui/icons-material';
import { Button } from '@mui/material';
import React, { useState, useMemo, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Autocomplete, TextField } from '@mui/material';
import { ClientContextConsumer } from './cxtProvider';
import { customFetch } from '../Auth/customFetch';
import { useRouter } from 'next/router';


export default function TestProfileBilling({ test }) {
  const [testportal, setTestPortal] = useState([]);
  const [previousTest, setPreviousTest] = useState(test || []);
  const [workingTest, setWorkingTest] = useState([]);
  const [initiated, setIniated] = useState([])
  const [testvalueid, setTestValueId] = useState(null);
  const router = useRouter().query
  // define ref on the auto complete input field
  const AutocompleteRef = useRef(null);

  // amount paid 

  // using useMemo get the test data
  useMemo(async () => {
    // get the test data
    try {
      const { result } = await customFetch(`testpanel/list/update?billingid=${router.billingid}`);
      const { data } = await customFetch('testpanel/list');
      setTestPortal(data);

      let created = [];

      for (let i = 0; i < previousTest.length; i++) {
        for (let j = 0; j < data.length; j++) {
          if (previousTest[i] == data[j]['NAME']) {
            const taken = result.filter((item, index) => {
              return item.TESTID == data[j]['ID']
            })

            taken.length > 0 ? created.push(taken[0]) : created.push(data[j])
          }
        }
      }
      setWorkingTest(created)
    } catch (error) {
      throw error;
    }
  }, [])






  // this function handles the add test autocomeplete input field , takes the id of the test and add it to the working test
  const handleAddTest = (e, value) => { value != null ? setTestValueId(value.ID) : setTestValueId(null) }


  // this function handles the add test button , takes the id of the test and add it to the working test
  const handleAddTestButton = () => {
    if (testvalueid != null) {
      const test = testportal.find((item) => item.ID === testvalueid)
      // check if the test is already in the working test
      const check = workingTest.find((item) => item.TESTID === testvalueid)
      if (check === undefined) {
        setWorkingTest([...workingTest, test]);
        // make the input field empty and focus on it
      }
      else {
        alert('Test already added')
      }
    }
  }



  // this function removes the test from the working test

  const handleRemoveTest = (id) => {
    const dataid = id.ID;
    // if test is processing or ready , we would not remove the test
    const test = workingTest.filter((item) => item.ID == dataid)
    const { READY, PROCESSING } = test[0];
    if (READY == 'true' || PROCESSING == 'true') {
      alert('Test processing or with result ready cannot be removed');
    } else {
      setWorkingTest(workingTest.filter((item) => item.ID != dataid))
    }
  }


  // this function sum up the total price of the test in the working test

  const handleTotalPrice = () => {
    const total = workingTest.reduce((acc, item) => {
      return parseInt(acc) + parseInt(item?.PRICE)
    }, 0)
    return total
  }


  // this functionwould get the symbol of the currency  form local storage and if it is not available it would return the default currency which is ghana cedi

  const handleCurrency = () => {
    const currency = localStorage.getItem('currency')
    if (currency === null) {
      return 'GHS' + ' '
    }
    else {
      return currency + ' '
    }
  }


  // this function remove all test from the working state

  const removeAllTest = async () => {
    let confirmRemoval = confirm('Do you want to remove all the test from the cart including the previous test?. Only test that is yet to be processed will be removed');
    // if yes ,check if the samples have already been processed 
    // if processed, remove all and populate with previous test,
    // if not processed remove all.
    if (confirmRemoval) {
      // setWorkingTest([]);
      let nw = workingTest.filter((item, index) => { return item.PROCESSING == 'true' || item.READY == 'true' });
      setWorkingTest(nw)
    }
    return;
  }


  // this sends data to server for updates after validations 
  const updateBilling = function (ev, details, paid) {
    const wlen = workingTest.length === 0;
    if (wlen) return alert('Cannot update billing status with empty test cart.kindly add test to the cart or remove the transaction if test are not no longer required');

    if (!wlen) {
      let billSummary = {
        test: workingTest.map((item, index) => {
          return { name: item.NAME, testid: item.ID }
        }),
        totalcost: handleTotalPrice(),
        patientid: details[0]?.['PATIENTID'],
        billingid: details[0]?.['BILLINGID'],
        outstanding: handleTotalPrice() - paid
      }

      try {
        // forward data to the server
        const pushdb = async () => {
          let response = await (fetch(`${process.env.BASEURL}/billing`, {
            method: 'PUT',
            headers: {
              'content-type': 'application/json',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
            },
            body: JSON.stringify(billSummary)
          }))

          let data = await response.json();
          const { status, statusCode, err, message } = data;

          if (status === 'success' && statusCode === 200) {
            alert(message);
          }

          if (err) {
            alert(err?.message);
          }

        }


        pushdb();
      } catch (err) {
        AbortController()
      }
    }
  }


  const validateProgres = function (target, id) {
    const getSpecific = initiated.filter((t, i) => { return t.TESTID == id })
    return getSpecific[0]?.[`${target}`]
  }


  return (
    <>
      <ClientContextConsumer>
        {
          clientDetails => {
            const amountpaid = clientDetails[0]?.['PAID_AMOUNT'];
            return (
              <>
                <div className='add-new-test'>
                  <Autocomplete
                    id="test-panel-auto-complete"
                    options={testportal}
                    getOptionLabel={(option) => option.NAME}
                    style={{ width: 'inherit' }}
                    size='small'
                    renderInput={(params) => <TextField {...params} label="Test panels" variant="outlined" />}
                    onChange={handleAddTest}
                    ref={AutocompleteRef}
                  />

                  <button className='custom-button'
                    onClick={() => handleAddTestButton()}
                  >
                    <AddIcon />
                    Add Test
                  </button>
                </div>
                <div className='billing-personal-info'>
                  {/* create a table */}
                  <table id='custom-table'>
                    <thead>
                      <tr>
                        <th>Test Name</th>
                        <th>Test Price</th>
                        <th>sample</th>
                        <th>collection status</th>
                        <th>processing </th>
                        <th>result ready</th>
                        <th>action</th>
                        <th>payment made </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* map through the test data */}
                      {
                        workingTest.length > 0 && workingTest.map((item, index) => {
                          return (
                            <tr key={index} id='move-left-sm'>
                              <td>{item?.NAME}</td>
                              <td>{item?.PRICE}</td>
                              <td>{item?.SAMPLE || 'BLOOD'}</td>
                              <td className={item?.COLLECTION == 'true' ? 'text-success' : 'text-danger'}>
                                {
                                  item?.COLLECTION == 'true' ? 'collected' : 'Not yet'
                                }
                              </td>
                              <td className={item?.PROCESSING == 'true' ? 'text-success' : 'text-danger'}>
                                {item?.PROCESSING == 'true' ? 'processing' : 'Not yet'}
                              </td>
                              <td className={item?.READY == 'true' ? 'text-success' : 'text-danger'}>
                                {item?.READY == 'true' ? 'result ready' : 'Not yet'}
                              </td>
                              <td>
                                <Button color='error' size='small'
                                  onClick={() => handleRemoveTest(item)}>
                                  <DeleteOutlineTwoTone />
                                  remove
                                </Button>
                              </td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total</td>
                        <td className='lims-text-color'>{handleCurrency()}{handleTotalPrice()}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                          {
                            workingTest.length > 0 && (
                              <Button variant='contained' size='small' className='mt-2' color='error' onClick={(e) => removeAllTest()}>
                                remove all test
                              </Button>
                            )
                          }
                        </td>
                        <td>
                          {amountpaid}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  {/* amount to pay */}
                  <div className='d-flex justify-content-between alert alert-warning' id='billing-update-payment'>
                    <h5>Payment details</h5>
                    <h6 className='lims-text-color'>
                      <p>Amt paid:{amountpaid} </p>
                      <p>Discount: {clientDetails[0]?.['DISCOUNT']}</p>
                      <p>Outstanding: {clientDetails[0]?.['OUTSTANDING']}</p>
                      <p>Amount to pay: {handleCurrency()}{handleTotalPrice() - amountpaid}</p>
                    </h6>
                  </div>
                  <div id='update-billing-button' className='mb-5'>
                    <Button variant='contained'
                      color='primary' className='custom-button' onClick={(e) => updateBilling(e, clientDetails, amountpaid)}>
                      update billing info
                    </Button>
                  </div>
                </div>
                <div>
                  <h5>payment</h5>
                  <input className='custom-input' />
                </div>
              </>
            )
          }
        }
      </ClientContextConsumer>
    </>
  )
}
