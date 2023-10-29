import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import { useRouter } from 'next/router';
import SidebarFrontPage from '../../components/frontpagesidebar';

export default function Appointment() {
  const router = useRouter();
  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <div>
          <button onClick={(ev) => { router.push('/appointments/book') }} className="btn btn-primary my-2 mx-2">Add Appointment</button>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height={'100vh'}
          />
        </div>
      </SettingsLayout>
    </>
  )
}


