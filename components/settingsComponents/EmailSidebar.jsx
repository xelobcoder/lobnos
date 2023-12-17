import React from 'react'
import Link from 'next/link'
import { Analytics, Error, Forward, Home, RoomPreferences, SettingsApplications } from '@mui/icons-material'

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
                <Link href={'/settings/emailsetting/customemail'}> compomse email</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <Forward/>
              </div>
              <div className="text">
                <Link href={'/settings/emailsetting/emails'}>Sent/Draft Emails</Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
