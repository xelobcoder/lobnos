import { DeleteOutlineTwoTone } from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import { Autocomplete } from '@mui/joy';
import { currencyFormatter, customFetch, customPost } from '../Auth/customFetch';
import { ToastContainer, toast } from 'react-toastify';
import Link from 'next/link';

export default function TestProfileBilling({ clientDetails }) {
  const [billingdata, setBillingdata] = useState({ ...clientDetails, totalCost: 0 });
  const { paid_amount,  taxValue, taxIncluded, billingid, outstanding, discount, patientid } = billingdata;
  const [loading, setLoading] = useState(true);
  const [testportal, setTestPortal] = useState([]);
  const [workingTest, setWorkingTest] = useState([]);
  const [testvalueid, setTestValueId] = useState(null);
  const [initoutstanding, setOutstanding] = useState(outstanding);
  const [appsettings, setAppsettings] = useState({});


  const getUpdateInformation = useCallback(async function () {
    try {
      const { result } = await customFetch(`testpanel/list/update?billingid=${billingid}`);
      const { data } = await customFetch('testpanel/list/bulk');
      setTestPortal(data);
      setWorkingTest(result)
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }, [billingid])


  useEffect(() => {
    getUpdateInformation();
    customFetch(`applicationsettings/billing`)
      .then((data) => {
        setAppsettings(data);
      }).catch((err) => {
        console.log(err)
      })
  }, [getUpdateInformation]);

  // this function sum up the total price of the test in the working test

  const handleTotalPrice = () => {
    if (workingTest.length === 0) return 0;
    return workingTest.reduce((acc, item) => { return parseInt(acc) + parseInt(item?.price) }, 0);
  };



  const readjustBill = function () {
    if (workingTest.length > 0) {
      const totalPricing = handleTotalPrice();
      const { includeTax, taxValue } = appsettings;
      let outstanding = 0;
      if (includeTax == 1) {
        outstanding = ((totalPricing * taxValue) + totalPricing) - (paid_amount + discount);
      } else {
        outstanding = totalPricing - (paid_amount + discount);
      }
      setBillingdata({ ...billingdata, testcost: totalPricing, outstanding, taxValue })
    }
  }



  useEffect(() => {
    if (workingTest.length > 0) {
      readjustBill();
    }
  }, [workingTest.length])






  // this function handles the add test button , takes the id of the test and add it to the working test
  const handleAddTestButton = () => {
    const { id } = testvalueid;
    if (testvalueid != null) {
      const inWorkingList = workingTest.filter((item) => {
        return 'testid' in item ? item.testid === id : item.id === id;
      });
      inWorkingList.length > 0 ? toast.error('item aleady in test cart!!!') : setWorkingTest([...workingTest, testvalueid])
      readjustBill()
    }
  }



  // this function removes the test from the working test

  const handleRemoveTest = (id) => {
    'collection_date' in id && id?.collection === 'true' ?
      toast.info('Test processing or with result ready cannot be removed') :
      setWorkingTest(workingTest.filter((item) => item.testid != id?.testid))
  }



  // this function remove all test from the working state

  const removeAllTest = async () => {
    let confirmRemoval = confirm('Do you want to remove all the test from the cart including the previous test?. Only test that is yet to be processed will be removed');
    if (confirmRemoval) {
      setWorkingTest((prev) => {
        const nw = prev;
        return nw.filter((item, index) => { return item?.processing == 'true' || item?.ready == 'true' });
      });
    }
    return;
  }


  // this sends data to server for updates after validations 
  const updateBilling = async function (ev, details, paid) {
    // transformed data so that testid is captured in the array as data was pooled from dif source , with those with testid having their testid as id
    const workingData = workingTest.map((item, index) => {
      if ('testid' in item) {
        return { testid: item?.testid }
      } else {
        return { testid: item?.id }
      }
    })

    const { testcost, paid_amount, patientid, discount, outstanding, taxIncluded, taxValue, billingid } = billingdata
    const data = {
      test: workingData, totalcost: testcost, patientid, discount, outstanding, taxIncluded, taxValue, paid_amount, billingid
    }
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
              // size='small'
              placeholder='search test'
              onChange={(value, newValue) => { setTestValueId(newValue) }}
            />

            <button className='btn btn-primary btn-sm py-0'
              onClick={() => handleAddTestButton()}
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-plus-lg"
                viewBox="0 0 16 16">
                <path fillRule="evenodd"
                  d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
              </svg>
              Add Test
            </button>
          </div>
        </div>
        <div className='card-body'>
          <div className='grid-50'>
            <div>
              <h6>Billing Tests</h6>
              <table className='table'>
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Test Price</th>
                <th>action</th>
                <th>payment made </th>
              </tr>
            </thead>
                <tbody>
              {
                workingTest.length > 0 && workingTest.map((item, index) => {
                  return (
                    <tr key={index} id='move-left-sm'>
                      <td className='lims-text-color'>{index + 1}.{" "}{item?.name}</td>
                      <td>{item?.price}</td>
                      <td>
                        <DeleteOutlineTwoTone onClick={() => handleRemoveTest(item)} color='error' />
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
            <tfoot>
              <tr>
                <td >Total</td>
                    <td className='lims-text-color' >{currencyFormatter.format(billingdata.testcost)}</td>
                <td>
                  {
                    workingTest.length > 0 && (
                      <button className='mt-2 btn-danger btn-sm btn text-capitalize' color='error' onClick={(e) => removeAllTest()}>
                        remove all
                      </button>
                    )
                  }
                    </td>
              </tr>
            </tfoot>
          </table>
            </div>
            <div>
              <h6>Previous payment information</h6>
              {appsettings.includeTax != billingdata?.taxIncluded && (
                <div className='alert alert-danger'>
                  Tax status between this and the previous transactions do not match. Initiate new transaction to prevent errors in accounting.
                  <br />
                  <Link href={`/billing/patientid?patientid=${patientid}`} className='border-bottom border-secondary border-2'>Initiate new Transaction </Link>
                </div>
              )}
              <div className='lims-text-color  alert alert-info  text-sm'>
                <p>Tax included:  {taxIncluded == 0 ? 'No' : 'Yes'}</p>
                <p>Tax Value: {taxValue}</p>
              <p>
                  Total {billingdata.taxIncluded == 1 ? "(Tax Inclusive)" : '(Tax exclusive)'} {" : "}
                  {currencyFormatter.format(billingdata.testcost + billingdata.taxValue)}
              </p>
                <p>Discount : {discount}</p>
                <p>Amount paid: {paid_amount}</p>
                <p className='text-danger fw-bold text-capitalize'>current outstanding: {billingdata.outstanding}</p>
            </div>
          </div>
          </div>
          <div className='d-flex justify-content-end'>
            {billingdata.outstanding > 0 && (
              <Link href={`/billing/payment/update/${patientid}`}>
                <button
                  className='btn btn-primary btn-sm my-3 mx-2'
                >
                  update payment
                </button>
              </Link>
            )}
            <button
              disabled={appsettings.includeTax != taxIncluded}
              className='btn btn-primary btn-sm my-3' onClick={(ev) => { updateBilling() }} >
              update billing info
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
