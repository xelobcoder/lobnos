import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '../Auth/useAuthentification';
import LoginCredentials from '../../pages/authentication/login';
import { useEffect } from 'react';
export default function MAIN_LAYOUT({ children }) {
  const { auth, updateAuthentication } = useContext(AuthContext);
  const navigate = useRouter();

  useEffect(() => {

    if (auth == null || auth == undefined || auth == '') {
      let user = localStorage.getItem('user');
      if (user == null || user == undefined || user == '') {
        if (navigate.pathname !== '/authentication/login') {
          navigate.push('/authentication/login')
        }
      } else {
        updateAuthentication(JSON.parse(user))
      }
    }
  }, [])

  console.log(auth)
  return (
    <>
      <div>
        {children}
      </div>
    </>
  )
}
