import FrontDeskLayout from '../../components/Layout/FrontDeskLayout';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'// a plugin!
export default function Appointment() {
  const handleDateClick = (arg) => {
    alert(arg.dateStr)
  }

  return (
    <FrontDeskLayout>
      <h4>Appointments</h4>
      {/* <FullCalendar
        weekends={false}
        events={[
          { title: 'event 1', date: '2024-06-03' },
          { title: 'event 2', date: '2024-06-07' }
        ]}
        dateClick={handleDateClick}
        plugins={[dayGridPlugin, multiMonthPlugin]}
        initialView="multiMonthYear"
      /> */}
      <div className='responsive'>
        <table className='table'>
          <thead>
            <tr>
              <th className='fw-bold'>Method</th>
              <th className='fw-bold'>Description</th>
              <th className='fw-bold'>value</th>
              <th className='fw-bold'>fields</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>

            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.e This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.e This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.e This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.e This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.e This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
            <tr>
              <td className='text-sm'>Method</td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number'  /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </FrontDeskLayout>
  )
}


