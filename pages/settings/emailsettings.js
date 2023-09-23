import React from 'react'
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'

export default function ApplicationEmailSettings() {
  return (
    <SettingsLayout>
      <div className='container'>
        <h3>Update Email Settings</h3>
        <div className='alert alert-info p-3'>
          All this information are vital for sending email verification notifications to clients when a new registration is done
          and for delivery result when is done. All clients that subscribed for results and billing voice to be sent by email will see this. All the information are encrypted and stored for security purposes.
        </div>
        <form className='mt-2'>
          <div className='form-row mt-4'>
            <label>service provider</label>
            <input type='text' className='form-control' required placeholder='eg: gmail,github,yahoo,mailtrap etc' />
          </div>
          <div className='form-row mt-4'>
            <label>Application username</label>
            <input type='email' className='form-control' required placeholder='yourapp@example.com' />
          </div>
          <div className='form-row mt-4'>
            <label>Application Password</label>
            <input type='password' className='form-control' required placeholder='your-email-password' />
          </div>
          <div className='form-row mt-4'>
            <label>Email verification Subject <span className='text-danger'>(please keep it brief as possible)</span></label>
            <textarea rows={2} className='form-control' required />
          </div>
          <div className='form-row mt-4'>
            <button className='btn btn-primary'>update information</button>
          </div>
        </form>
      </div>

    </SettingsLayout>
  )
}
