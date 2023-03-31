import { DeleteOutlineTwoTone } from '@mui/icons-material';
import { Button } from '@mui/material';
import React, { useState, useMemo, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Autocomplete, TextField } from '@mui/material';
import { ClientContextConsumer } from './cxtProvider';


export default function TestProfileBilling({ test }) {
  const [testportal, setTestPortal] = useState([]);
  const [previousTest, setPreviousTest] = useState(test || []);
  const [workingTest, setWorkingTest] = useState([]);
  const [testvalueid, setTestValueId] = useState(null);
  // define ref on the auto complete input field
  const AutocompleteRef = useRef(null);

  // amount paid 

  // using useMemo get the test data
  useMemo(() => {
    // get the test data
    const getTest = async () => {
      const res = await fetch(`${process.env.BASEURL}/testpanel/list`)
      const data = await res.json()
      if (data.length > 0) {
        setTestPortal(data)

        if (previousTest.length > 0) {
          // get the test data from the database
          const test = previousTest.map((item) => {
            return data.find((i) => i.NAME === item)
          })

          setWorkingTest(test)
        }
      }

    }
    getTest();

  }, [])






  // this function handles the add test autocomeplete input field , takes the id of the test and add it to the working test
  const handleAddTest = (e, value) => { value != null ? setTestValueId(value.ID) : setTestValueId(null) }


  // this function handles the add test button , takes the id of the test and add it to the working test
  const handleAddTestButton = () => {
    if (testvalueid != null) {
      const test = testportal.find((item) => item.ID === testvalueid)
      // check if the test is already in the working test
      const check = workingTest.find((item) => item.ID === testvalueid)
      if (check === undefined) {
        setWorkingTest([...workingTest, test]);
        // make the input field empty and focus on it
        AutocompleteRef.current.focus();
      }
      else {
        alert('Test already added')
      }
    }
  }



  // this function removes the test from the working test

  const handleRemoveTest = (id) => {
    const dataid = id.ID;
    const test = workingTest.filter((item) => item.ID !== dataid)
    setWorkingTest(test)
  }


  // this function sum up the total price of the test in the working test

  const handleTotalPrice = () => {
    const total = workingTest.reduce((acc, item) => {
      return parseInt(acc) + parseInt(item.PRICE)
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
    let confirmRemoval = confirm('do you want to remove all the test from the cart including the previous test?');
    // if yes ,check if the samples have already been processed 
    // if processed, remove all and populate with previous test,
    // if not processed remove all.

    if (confirmRemoval) {
      setWorkingTest([]);
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
                        <th>collection status</th>
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
                              <td>{item.NAME}</td>
                              <td>{item.PRICE}</td>
                              <td></td>
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
                  <div className='d-flex justify-content-between' id='billing-update-payment'>
                    <h5>Payment details</h5>
                    <h6 className='lims-text-color'>
                      <p>Amt paid:{amountpaid} </p>
                      <p>Discount: {clientDetails[0]?.['DISCOUNT']}</p>
                      <p>Outstanding: {clientDetails[0]?.['OUTSTANDING'] }</p>
                      <p>Amount to pay: {handleCurrency()}{handleTotalPrice() - amountpaid}</p>
                    </h6>
                  </div>
                  <div id='update-billing-button' className='mb-5'>
                    <Button variant='contained'
                      onClick={(e) => console.log(workingTest)}
                      color='primary' className='custom-button'>
                      update billing info
                    </Button>
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
