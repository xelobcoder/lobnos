import React from 'react'
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'
import AuthenticationSidebar from '../../components/settingsComponents/AuthenticationSidebar'

export default function ApplicationLoginHistory() {
  return (
    <>
      <SettingsLayout sidebar={<AuthenticationSidebar />}>
        <div className='container mt-2'>
          <h3 className='text-primary'>Login History</h3>
          <table className='table' id='custom-table'>
            <thead>
              <tr>
                <th>#</th>
                <th>employeeid</th>
                <th>Fullname</th>
              </tr>
            </thead>
          </table>
        </div>
      </SettingsLayout>
    </>
  )
}
