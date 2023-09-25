import React from 'react'
import { handleChangeWithState } from '../Auth/customFetch'

export default function SmsUpdateComponent({ data, setData, handleSubmit }) {
  return (
    <>
      <div className='p-3 container'>
        <div className='alert alert-info '>
          <strong>
            To use sms service, you need to be activated for it. Activation API KEY AND AUTH key required to use a third party service like mtn sms gateway to forward messages. Reqular sms bundle need to be subscribed.
          </strong>
        </div>
        <div>
          <form >
            <div className='alert bg-light'>
              <label> Forward message after registration is done <span className='text-danger'>(selected:{data.registration})</span><br />
                <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'registration', setData, data)} name='registration' value='Yes' /> Yes <br />
                <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'registration', setData, data)} name='registration' value='No' /> No
              </label>
            </div>
            <h5>Example</h5>
            <div className='alert alert-warning col-12'>
              <h6>Your labname</h6>
              <strong>
                Thank you for coming to our diagnostic laboratory, you can track your result online using this login credentials 9300303 and  temporary password ******. Visit <a href=''>yourlab.com </a> to continue.
              </strong>
            </div>
            <div className='alert bg-light'>
              <label> Forward message after result is ready and approved  <span className='text-danger'>(selected:{data.result})</span> <br />
                <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'result', setData, data)} name='result' value='Yes' /> Yes <br />
                <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'result', setData, data)} name='result' value='No' /> No
              </label>
            </div>
            <h5>Example</h5>
            <div className='alert alert-warning col-12'>
              <h6>Your labname</h6>
              <strong>
                Thank you for coming to our diagnostic laboratory,Visit our online portal to view your result at <a href=''>patients.yourlab.com </a>. the hardcopy will be present the facillity for collection.
              </strong>
            </div>
            <div className='alert bg-light'>
              <label> Forward message on birthday of client  <span className='text-danger'>(selected:{data.birthday}) </span><br />
                <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'birthday', setData, data)} name='birthday' value='Yes' /> Yes <br />
                <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'birthday', setData, data)} name='birthday' value='No' /> No
              </label>
            </div>
            <div className='alert bg-light'>
              <label> Forward message on event of sample rejection <span className='text-danger'>(selected:{data.sample})</span><br />
                <input type='radio' name='sample' onChange={(ev) => handleChangeWithState(ev, 'sample', setData, data)} value='Yes' /> Yes <br />
                <input type='radio' name='sample' onChange={(ev) => handleChangeWithState(ev, 'sample', setData, data)} value='No' /> No
              </label>
            </div>
            <div>
              <button onClick={(ev) => { handleSubmit() }} type='button' className='btn btn-success'>update sms settings</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
