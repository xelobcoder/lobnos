import React, { createContext, useState } from 'react';
import { useRouter } from 'next/router';
const AuthContext = createContext(null);
const AuthProvider = AuthContext.Provider;

export const AuthentificationProvider = ({ children }) => {
  const router = useRouter();
  const [auth, setAuthentication] = useState({});
  const updateAuthentication = (nw) => setAuthentication(nw)



  return (
    <>
      <AuthProvider value={{ auth, updateAuthentication }}>
        {children}
      </AuthProvider>
    </>
  )
}


export default AuthContext;