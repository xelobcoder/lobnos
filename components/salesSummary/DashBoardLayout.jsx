import React, { useContext } from 'react'
import SettingsLayout from '../settingsComponents/SettingsLayout'
import DashboardSidebar from './DashboardSidebar'
import AuthContext from '../Auth/useAuthentification'
import Authorization from '../accessories/authorization';

export default function DashBoardLayoutSales({ children }) {
  const { auth } = useContext(AuthContext);
  return (
    <>
      {["manager", "admin"].includes(auth?.role)
        ?
        (
          <SettingsLayout sidebar={<DashboardSidebar auth={auth} />}>
          <div className='px-2'>{children}</div>
        </SettingsLayout>
        )
        :
        (
          <Authorization/>
        )
      }
    </>
  )
}
