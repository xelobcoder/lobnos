import React, { useContext, useState } from 'react';
import AuthContext from '../Auth/useAuthentification';
import LoginCredentials from '../../pages/authentication/login';
import { useEffect } from 'react';
export default function MAIN_LAYOUT({ children }) {
  const { auth, updateAuthentication } = useContext(AuthContext);

  useEffect(() => {
    let user = null;
    if (typeof window !== 'undefined') {
      user = localStorage.getItem('user');
      user = JSON.parse(user)
    }
    updateAuthentication(user)
  }, [])
  console.log(auth)
  return (
    <>
      {
        auth?.EMPLOYEEID != undefined && auth?.ROLE != undefined ? (
          <>
            <div>
              {children}
            </div>
          </>
        )
          : (
            <LoginCredentials />
          )
      }
    </>
  )
}
