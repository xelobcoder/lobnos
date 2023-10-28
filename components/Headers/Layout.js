import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '../Auth/useAuthentification';
import { useEffect } from 'react';
import { customFetch } from '../Auth/customFetch';


export default function MAIN_LAYOUT({ children }) {
  const { auth, updateAuthentication } = useContext(AuthContext);
  const navigate = useRouter();


  let isAuthenticated = async function () {
    if (auth == null || auth == undefined || auth == '' || Object.keys(auth).length == 0) {
      let user = await window.cookieStore.get('X-AUTH-PRIME-LAB-SYSTEMS');
      if (user == null || user == undefined || user == '' || Object.keys(user).length == 0) {
        if (navigate.pathname !== '/authentication/login') {
          navigate.push('/authentication/login')
        }
      } else {
        const token = user?.value;
        const authentic = await customFetch(`authenticate/employee/token?token=${token}`);
        const { statusCode, status } = authentic;
        if (statusCode == 200 && status == 'success') {
          const { username, role, email, employeeid } = authentic?.user;
          const permissions = JSON.parse(authentic?.user?.permissions);
          updateAuthentication({ username, role, email, employeeid, permissions })
        }
      }
    }
  }

  useEffect(() => { isAuthenticated() }, [])



  return (
    <>
      {children}
    </>
  )
}
