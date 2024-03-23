import  { useContext, useEffect } from 'react';
import AuthContext from '../Auth/useAuthentification';
import { isAuthenticated } from '../Auth/customFetch';
import { useRouter } from 'next/navigation';

export default function MAIN_LAYOUT({ children }) {
  const { auth, updateAuthentication } = useContext(AuthContext);;
  const router = useRouter();

  useEffect(() => {
    isAuthenticated(auth, router, updateAuthentication)
  }, [])
  
  return (
    <>
      {children}
    </>
  )
}
