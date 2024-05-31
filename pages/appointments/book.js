import { Forward } from '@mui/icons-material'
import FrontDeskLayout from '../../components/Layout/FrontDeskLayout'

export default function BookAppointment() {
  return (
    <FrontDeskLayout>
      <div className='mx-2 bg-primary-subtle p-3 br-5'>
        <h3>Booking Appointment</h3>
        <label>reason</label>
        <textarea rows={5} className='form-control' required />
        <label>Date</label>
        <br/>
        <input className='form-control-sm' required type='date' placeholder='date' />
        <br />
        <button className='btn btn-primary mt-2 btn-sm'>book Appointment <Forward /> </button>
      </div>
    </FrontDeskLayout>
  )
}
