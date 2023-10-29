import React from 'react'
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'
import { Forward } from '@mui/icons-material'
import SidebarFrontPage from '../../components/frontpagesidebar'

export default function BookAppointment() {
  return (
    <SettingsLayout sidebar={<SidebarFrontPage/>}>
      <div className='mx-3'>
        <h3>Booking Appointment</h3>
        <label>reason</label>
        <textarea rows={5} className='form-control' required />
        <label>Date</label>
        <input className='form-control' required  type='date' placeholder='date' />
        <button className='btn btn-primary mt-2'>book Appointment <Forward /> </button>
      </div>
    </SettingsLayout>
  )
}
