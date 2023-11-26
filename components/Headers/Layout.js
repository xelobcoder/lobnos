import React, { useContext, useEffect } from 'react';
import AuthContext from '../Auth/useAuthentification';
import { isAuthenticated } from '../Auth/customFetch';
import { usePathname } from 'next/navigation';

export default function MAIN_LAYOUT({ children }) {
  const { auth, updateAuthentication } = useContext(AuthContext);
  const pathname = usePathname();
  useEffect(() => { isAuthenticated(auth, pathname, updateAuthentication) }, [])
  return (
    <>
      {children}
    </>
  )
}
