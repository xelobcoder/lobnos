import { createContext, useContext, useState } from 'react';
import { store } from '../../lib/store';
const AuthContext = createContext(null);

const ApplicationContext = createContext(store);
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
  return useContext(ApplicationContext);
}

export default AuthContext;


