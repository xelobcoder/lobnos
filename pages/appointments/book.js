import { Forward } from '@mui/icons-material'
import FrontDeskLayout from '../../components/Layout/FrontDeskLayout'

export default function BookAppointment() {
  return (
    <FrontDeskLayout>
      <div className='mx-3'>
        <h3>Booking Appointment</h3>
        <label>reason</label>
        <textarea rows={5} className='form-control' required />
        <label>Date</label>
        <input className='form-control' required  type='date' placeholder='date' />
        <button className='btn btn-primary mt-2'>book Appointment <Forward /> </button>
      </div>
    </FrontDeskLayout>
  )
}
