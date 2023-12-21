import React, { useContext, useEffect,useState } from 'react'
import SettingsLayout from './SettingsLayout'
import SettingsSidebarLayout from './sidebars'
import AuthContext from '../Auth/useAuthentification'
import Authorization from '../accessories/authorization';
import { getApplicationSettings } from '../Auth/customFetch';


export default function MainSettingsLayoutView({ children, sidebar }) {
  const { auth } = useContext(AuthContext);
  const authorized = ['manager', 'admin'].includes(auth?.role) != false;
 

  return (
    <>
      {authorized ? (
          <SettingsLayout sidebar={sidebar || <SettingsSidebarLayout />}>
          {children}
        </SettingsLayout>
        ) : (
        <Authorization />
      )}
    </>
  );
}
