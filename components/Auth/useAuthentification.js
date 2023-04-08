import React, { createContext, useEffect, useState } from 'react';

let user = null;
  if (typeof window !== 'undefined') {
     user = {user: localStorage.getItem('user')}
  }


const AuthContext = createContext(user);

const AuthProvider = AuthContext.Provider;

export const AuthentificationProvider = ({ children }) => {
  const [auth, setAuthentication] = useState({});
  return (
    <>
      <AuthProvider value={{ auth, setAuthentication }}>
        {children}
      </AuthProvider>
    </>
  )
}


export default AuthContext;