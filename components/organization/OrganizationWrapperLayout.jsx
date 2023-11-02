import React, { useState } from 'react'
import { Add, Info, List, Payment, Phone } from '@mui/icons-material'
import { useRouter } from 'next/router';
import SidebarFrontPage from '../frontpagesidebar';
import SettingsLayout from '../settingsComponents/SettingsLayout';

export default function OrganizationWrapperLayout({ children }) {


  const router = useRouter();
  const organizationid = router.query.id;
  const pushRouter = (target) => { router.push(target) }
  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <div className='mx-1'>
          <button className='btn btn  btn-secondary mt-1 mx-1 ' onClick={(ev) => { pushRouter('/organization/new') }}> <Add /> new organization </button>
          <button className='btn btn  btn-secondary mt-1 mx-1 ' onClick={(ev) => { pushRouter('/organization') }}><List /> organizations</button>
          {
            organizationid && (
              <>
                <button disabled={!organizationid} className='btn btn  btn-warning mt-1 mx-1 ' onClick={(ev) => { pushRouter(`/organization/${organizationid}/basicinfo`) }}> <Info /> basic information</button>
                <button disabled={!organizationid} className='btn btn  btn-warning mt-1 mx-1 ' onClick={(ev) => { pushRouter(`/organization/${organizationid}/contactperson`) }}><Phone /> contact person</button>
                <button disabled={!organizationid} className='btn btn  btn-warning mt-1 mx-1 ' onClick={(ev) => { pushRouter(`/organization/${organizationid}/payment`) }}><Payment /> payment modules</button>
              </>
            )
          }
          {children}
        </div>
      </SettingsLayout>
    </>
  )
}
