import React, { useState, useEffect } from 'react'
import { customFetch, customPost, handleChangeWithState, organizationPaymentDefault } from '../Auth/customFetch'
import { useRouter } from 'next/router';
import ISLOADING from '../isLoading';

export default function PaymentModule() {
  const [data, setData] = useState(organizationPaymentDefault);
  const [loading, setLoading] = useState(true)
  const organizationid = useRouter().query.id;


  const getPaymentData = async (organizationid) => {
    const response = await customFetch(`organization/payment?id=${organizationid}`);
    const { statusCode, status, result } = response;
    if (statusCode === 200 && status == 'success' && result.length > 0) { setData(result[0]);setLoading(false)}
  }

  useEffect(() => {
    if (organizationid) { getPaymentData(organizationid); }
  }, [organizationid])

  const handleSubmit = async () => {
    let pushResponse = await customPost(`organization/update/payment`, 'PUT', data);
    console.log(pushResponse);
  }

  return (
    <>
      <div className='alert alert-primary mx-2 my-1'>
        update payment  information {organizationid}
      </div>
      {loading ? <ISLOADING /> :
        (<>
          <form className='grid-2 mx-2 p-3 chaplain' id='registration'>
            <div className='form-row'>
              <label>payment method</label>
              <select
                className='custom-input'
                value={data.module}
                onChange={(event) => handleChangeWithState(event, 'module', setData, data)} >
                <option>select payment method</option>
                <option value='cash'>Cash</option>
                <option value="bank">Bank transfer</option>
                <option value="momo">Mobile Money</option>
              </select>
            </div>

            <div className='form-row'>
              <label>commission <span className='label-helper'>in percentage(eg.10%)</span></label>
              <input
                className='custom-input'
                type='number'
                value={data.commission}
                onChange={(event) => handleChangeWithState(event, 'commission', setData, data)}

              />
            </div>
            {data.module == 'momo' && (
              <>
                <div className='form-row'>
                  <label>momo account number</label>
                  <input
                    className='custom-input'
                    value={data.momo}
                    type='tel'
                    minLength={10}
                    maxLength={10}
                    required
                    inputMode='tel'
                    onChange={(event) => handleChangeWithState(event, 'momo', setData, data)}

                  />
                </div>
                <div className='form-row'>
                  <label>momo account Name</label>
                  <input
                    className='custom-input'
                    value={data.momoname}
                    type='text'
                    required
                    inputMode='text'
                    onChange={(event) => handleChangeWithState(event, 'momoname', setData, data)}

                  />
                </div>
              </>
            )}
            {data.module == 'bank' && (
              <>
                <div className='form-row'>
                  <label>account number</label>
                  <input
                    type='number'
                    className='custom-input'
                    value={data.account}
                    onChange={(event) => handleChangeWithState(event, 'account', setData, data)}

                  />
                </div>
                <div className='form-row'>
                  <label>Bank name</label>
                  <input
                    className='custom-input'
                    value={data.bankname}
                    onChange={(event) => handleChangeWithState(event, 'bankname', setData, data)}
                    type='text'

                  />
                </div>
                <div className='form-row'>
                  <label>branch </label>
                  <input
                    type='text'
                    className='custom-input'
                    value={data.branch}
                    onChange={(event) => handleChangeWithState(event, 'branch', setData, data)}

                  />
                </div>
                <div className='form-row'>
                  <label>account name</label>
                  <input
                    type='text'
                    className='custom-input'
                    value={data.accountname}
                    onChange={(event) => handleChangeWithState(event, 'accountname', setData, data)}
                  />
                </div>
              </>
            )}
          </form>
          <button
            type="button"
            className='btn btn-primary btn-sm mt-3 mx-2'
            onClick={handleSubmit}
          >
            Submit
          </button>
        </>)}
    </>
  )
}
