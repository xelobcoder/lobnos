import { DeleteOutlineTwoTone } from '@mui/icons-material';
import React, { useState, useMemo, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Autocomplete, TextField } from '@mui/material';
import { ClientContextConsumer } from './cxtProvider';
import { customFetch, customPost } from '../Auth/customFetch';
import { useRouter } from 'next/router';


export default function TestProfileBilling() {
  const [testportal, setTestPortal] = useState([]);
  const [workingTest, setWorkingTest] = useState([]);
  const [testvalueid, setTestValueId] = useState(null);
  const router = useRouter().query
  // define ref on the auto complete input field
  const AutocompleteRef = useRef(null);

  // amount paid 

  // using useMemo get the test data
  useMemo(async () => {
    // get the test data
    try {
      // fetch data of a specfic clirnt and test added during billin and current stage in the clinical testing 
      const { result } = await customFetch(`testpanel/list/update?billingid=${router.billingid}`);
      // this returns all the testpanel 
      const { data } = await customFetch('testpanel/list');
      setTestPortal(data);
      setWorkingTest(result)
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
          return { name: item.NAME, testid: item?.TESTID || item?.ID }
        }),
        totalcost: handleTotalPrice(),
        patientid: details[0]?.['PATIENTID'],
        billingid: details[0]?.['BILLINGID'],
        outstanding: handleTotalPrice() - paid
      }

      try {
        // forward data to the server
        const pushdb = async () => {
          let data = await customPost('billing', 'PUT', billSummary)
          const { status, statusCode, err, message } = data;
          if (status === 'success' && statusCode === 200) {
            alert(message);
          }

          if (err) {
            alert(err?.message);
          }

        }

        pushdb()


      } catch (err) {
        AbortController()
      }
    }
  }

  return (
    <>
      <ClientContextConsumer>
        {
          clientDetails => {
            const amountpaid = clientDetails[0]?.['PAID_AMOUNT'];
            return (
              <>
                <div className='card'>
                  <div className='card-header'>
                    <div className='m-0 d-flex justify-content-between'>
                      <Autocomplete
                        options={testportal}
                        getOptionLabel={(option) => option.NAME}
                        style={{ width: '80%' }}
                        size='small'
                        renderInput={(params) => <TextField {...params} label="Test panels" variant="filled" />}
                        onChange={handleAddTest}
                        ref={AutocompleteRef}
                      />

                      <button className='btn btn-primary btn-sm'
                    onClick={() => handleAddTestButton()}
                  >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                          <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                        </svg>
                    Add Test
                  </button>
                    </div>
                  </div>
                  <div className='card-body'>
                    <table className='billing-cart-table'>
                    <thead>
                      <tr>
                        <th>Test Name</th>
                        <th>Test Price</th>
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
                              <td className='lims-text-color'>{item?.NAME}</td>
                              <td>{item?.PRICE}</td>
                              <td>
                                <button className='btn btn-sm btn-danger py-0'
                                  onClick={() => handleRemoveTest(item)}>
                                  <DeleteOutlineTwoTone />
                                  remove
                                </button >
                              </td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                    <tfoot>
                      <tr>
                          <td >Total</td>
                          <td className='lims-text-color' >{handleCurrency()}{handleTotalPrice()}</td>
                        <td>
                          {
                            workingTest.length > 0 && (
                                <button className='mt-2 btn-danger btn-sm btn text-capitalize' color='error' onClick={(e) => removeAllTest()}>
                                  remove all
                                </button>
                            )
                          }
                        </td>
                        <td>
                          
                        </td>
                      </tr>
                      </tfoot>
                    </table>
                    <div className='mt-3' >
                      <h5>Payment details</h5>
                      <h6 className='lims-text-color d-flex gap-4 justify-content-between'>
                        <p>Amt paid = {amountpaid} </p>
                        <p>Discount =  {clientDetails[0]?.['discount']}</p>
                        <p>Outstanding =  {clientDetails[0]?.['outstanding']}</p>
                        <p>Amount to pay {handleCurrency()}{handleTotalPrice() - amountpaid}</p>
                      </h6>
                    </div>
                    <div className='d-flex justify-content-end'>
                      <button className='btn btn-primary btn-sm my-3' onClick={(e) => updateBilling(e, clientDetails, amountpaid)}>
                        update billing info
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )
          }
        }
      </ClientContextConsumer>
    </>
  )
}
