import FrontDeskLayout from '../../components/Layout/FrontDeskLayout';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from '@fullcalendar/multimonth';
export default function Appointment() {
  const handleDateClick = (arg) => {
    alert(arg.dateStr)
  }

  return (
    <FrontDeskLayout>
      <section className='d-flex justify-content-between my-1'>
      <h4>Appointments</h4>
        <button className='btn btn-primary btn-sm'>New Appointment</button>
      </section>
      <FullCalendar
        weekends={true}
        events={[
          { title: 'event 1', date: '2024-06-03' },
          { title: 'event 2', date: '2024-06-07' }
        ]}
        dateClick={handleDateClick}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
      />
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
              <td className='text-sm'>Method
               </td>
              <td className='text-sm'>This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.This is where the main content of the website goes.</td>
              <td>828</td>
              <td><input className='form-control' type='number' /></td>

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


