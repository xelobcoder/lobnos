import { DeleteOutlineTwoTone } from '@mui/icons-material';
import React, { useState, useEffect, useCallback } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { customFetch, customPost } from '../Auth/customFetch';
import { ToastContainer, toast } from 'react-toastify';


export default function TestProfileBilling({ clientDetails }) {
  const { paid_amount, payable, taxValue, taxIncluded, billingid, outstanding, discount } = clientDetails;
  const [loading, setLoading] = useState(true);
  const [testportal, setTestPortal] = useState([]);
  const [workingTest, setWorkingTest] = useState([]);
  const [testvalueid, setTestValueId] = useState(null);
  const [totalCost, setTotal] = useState(0);
  const [initoutstanding, setOutstanding] = useState(outstanding);

  const getUpdateInformation = async function () {
    try {
      // fetch data of a specfic clirnt and test added during billin and current stage in the clinical testing 
      const { result } = await customFetch(`testpanel/list/update?billingid=${billingid}`);
      // this returns all the testpanel 
      const { data } = await customFetch('testpanel/list/bulk');
      setTestPortal(data);
      setWorkingTest(result)
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }


  useEffect(() => { getUpdateInformation() }, []);

  // this function sum up the total price of the test in the working test

  const handleTotalPrice = useCallback(() => {
    if (workingTest.length > 0) {
      return workingTest.reduce((acc, item) => { return parseInt(acc) + parseInt(item?.price) }, 0);
    }
  }, [workingTest])


  useEffect(() => {
    if (workingTest.length > 0) {
      const totalPricing = handleTotalPrice();
      setTotal(totalPricing);
      const outstanding = (totalPricing + taxValue) - (paid_amount + discount);
      setOutstanding(outstanding)
    }
  }, [workingTest, handleTotalPrice])



  // this function handles the add test button , takes the id of the test and add it to the working test
  const handleAddTestButton = () => {
    const { id } = testvalueid;
    if (testvalueid != null) {
      const inWorkingList = workingTest.filter((item) => {
        return 'testid' in item ? item.testid === id : item.id === id;
      });
      inWorkingList.length > 0 ? toast.error('item aleady in test cart!!!') : setWorkingTest([...workingTest, testvalueid])
    }
  }



  // this function removes the test from the working test

  const handleRemoveTest = (id) => {
    'collection_date' in id && id?.collection === 'true' ?
      toast.info('Test processing or with result ready cannot be removed') :
      setWorkingTest(workingTest.filter((item) => item.testid != id?.testid))
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
      let nw = workingTest.filter((item, index) => { return item?.processing == 'true' || item?.ready == 'true' });
      setWorkingTest(nw)
    }
    return;
  }


  // this sends data to server for updates after validations 
  const updateBilling = async function (ev, details, paid) {
    // transformed data so that testid is captured in the array as data was pooled from dif source , with those with testid having their testid as id
    const workingData = workingTest.map((item, index) => { return !('testid' in item) ? { ...item, testid: item?.id } : item; })
    // backend data
    const data = { test: workingData, totalcost: totalCost, billingid, outstanding: initoutstanding, taxIncluded, taxValue, discount }
    const pushResponse = await customPost('billing', 'PUT', data);
    const { status, statusCode, message } = pushResponse;
    status === 'success' && statusCode == 200 ? toast.success(message) : toast.error(message);
  }

  return (
    <>
      <ToastContainer />
      <div className='card'>
        <div className='card-header'>
          <div className='m-0 d-flex justify-content-between'>
            <Autocomplete
              options={testportal}
              getOptionLabel={(option) => option.name}
              style={{ width: '70%' }}
              size='small'
              renderInput={(params) => <TextField {...params} label="Test panels" size='small' variant="outlined" />}
              onChange={(value, newValue) => { setTestValueId(newValue) }}
            />

            <button className='btn btn-primary btn-sm py-0'
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
                      <td className='lims-text-color'>{item?.name}</td>
                      <td>{item?.price}</td>
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
                <td className='lims-text-color' >{handleCurrency()}{totalCost}</td>
                <td>
                  {
                    workingTest.length > 0 && (
                      <button className='mt-2 btn-danger btn-sm btn text-capitalize' color='error' onClick={(e) => removeAllTest()}>
                        remove all
                      </button>
                    )
                  }
                </td>
                <td className=' px-4 fw-bolder'>
                {paid_amount}
                </td>
              </tr>
            </tfoot>
          </table>
          <div className='mt-3' >
            <h5>Payment details</h5>
            <div className='lims-text-color  alert alert-info  text-sm'>
              <p>Tax Value: {taxValue}</p>
              <p>
                Total {taxIncluded ? "(Tax Inclusive)" : '(Tax exclusive)'} {" : "}
                {taxIncluded ? (taxValue + totalCost) : (totalCost)}
              </p>
              <p>Discount : {discount}</p>
              <p>Outstanding:  {initoutstanding}</p>
            </div>
          </div>
          <div className='d-flex justify-content-end'>
            <button className='btn btn-primary btn-sm my-3' onClick={(ev) => { updateBilling() }} >
              update billing info
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
