import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '../Auth/useAuthentification';
import { useEffect } from 'react';
import { isAuthenticated } from '../Auth/customFetch';


export default function MAIN_LAYOUT({ children }) {
  const { auth, updateAuthentication } = useContext(AuthContext);
  const navigate = useRouter();




  useEffect(() => { isAuthenticated(auth, navigate, updateAuthentication) }, [])


  return (
    <>
      {children}
    </>
  )
}
