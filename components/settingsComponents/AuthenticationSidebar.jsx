import React from 'react'
import Link from 'next/link'
import { Analytics, AppRegistrationTwoTone, Error, Home, LoginSharp, Person, RoomPreferences, SettingsApplications } from '@mui/icons-material'
export default function AuthenticationSidebar() {
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
                <AppRegistrationTwoTone />
              </div>
              <div className="text">
                <Link href={'/authentication/register'}> register user</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <Person />
              </div>
              <div className="text">
                <Link href={'/authentication/users'}>Users</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <LoginSharp />
              </div>
              <div className="text">
                <Link href={'/authentication/loginhistory'}>Login History</Link>
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
          </ul>
        </div>
      </div>
    </>
  )
}
