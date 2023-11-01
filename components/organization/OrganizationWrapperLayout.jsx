import React, { useState, createContext } from 'react'
import { Add, Info, List, Payment, Phone } from '@mui/icons-material'
import { useRouter } from 'next/router';
import SidebarFrontPage from '../frontpagesidebar';
import SettingsLayout from '../settingsComponents/SettingsLayout';

export const OrgContext = createContext(null);
export const OrgContextProvider = OrgContext.Provider;

export default function OrganizationWrapperLayout({ children }) {
  const [userContext, setContext] = useState({ orgid: null, editing: false });

  const updateOrgContext = (value) => { setContext(value) }

  const router = useRouter();
  const pushRouter = (target) => { router.push(target) }
  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <OrgContextProvider value={{userContext,updateOrgContext}}>
          <div className='mx-1'>
            <button className='btn btn  btn-secondary mt-1 mx-1 ' onClick={(ev) => { pushRouter('/organization/new') }}> <Add /> new organization </button>
            <button className='btn btn  btn-secondary mt-1 mx-1 ' onClick={(ev) => { pushRouter('/organization') }}><List /> organizations</button>
            <button disabled={userContext.editing} className='btn btn  btn-secondary mt-1 mx-1 ' onClick={(ev) => { pushRouter('/organization/basicinfo') }}> <Info /> basic information</button>
            <button disabled={userContext.editing} className='btn btn  btn-secondary mt-1 mx-1 ' onClick={(ev) => { pushRouter('/organization/contactperson') }}><Phone /> contact person</button>
            <button disabled={userContext.editing} className='btn btn  btn-secondary mt-1 mx-1 ' onClick={(ev) => { pushRouter('/organization/payment') }}><Payment /> payment modules</button>
            {children}
          </div>
        </OrgContextProvider>
      </SettingsLayout>
    </>
  )
}
