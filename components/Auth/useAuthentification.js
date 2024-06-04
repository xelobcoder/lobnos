import { createContext, useContext, useState } from 'react';
const AuthContext = createContext(null);
const AuthProvider = AuthContext.Provider;

export const AuthentificationProvider = ({ children }) => {
  const [auth, setAuthentication] = useState({});
  const updateAuthentication = (nw) => { setAuthentication(nw) }
  return (
    <AuthProvider value={{ auth, updateAuthentication }}>
      {children}
    </AuthProvider>
  )
}


export const useTheme = () => {
  return useContext(AuthContext);
}
export default AuthContext;


