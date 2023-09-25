import React from 'react'
import Link from 'next/link'
import { Analytics, Error, Home, RoomPreferences, SettingsApplications } from '@mui/icons-material'

export default function EmailSidebarJSX() {
  return (
    <>
      <div className="settings-sidebar">
        <div className="contents">
          <ul>
            <li>
              <div className="icons">
                <Home />
              </div>
              <div className="text">
                <Link href={'/settings'}> settings Home</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <SettingsApplications />
              </div>
              <div className="text">
                <Link href={'/settings/emailsetting'}> Email setup</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <RoomPreferences />
              </div>
              <div className="text">
                <Link href={'/settings/emailsetting/preference'}>Email preference</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <Analytics />
              </div>
              <div className="text">
                <Link href={'/settings/emailsetting/analytics'}> charts</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <Error />
              </div>
              <div className="text">
                <Link href={'/settings/emailsetting/logs'}> Email Logs</Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
