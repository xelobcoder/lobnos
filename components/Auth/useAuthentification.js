import { createContext, useContext, useState } from 'react';
const AuthContext = createContext(null);

const store = {
  logout: false,
  theme: "light",
  role: null,
  employeeid: null,
  username: null,
  token: null,
  role: null,
  company: 'VITALSCAN LABORATORY AND DIAGNOSTIC CENTRE',
  branchid: null,
  centerid: null,
  synchronize: false,
  lastSynchronizationdate: null,
  headerColor: null,
  sidearColor: null,
  isConnectedInventory: false,
  isSupplierConnected: false,
  loginDuration: null,
  daysToExpiration:40,
  currency: null,
  decimalPlaces: 3,
  fontFamily: '"Lexend Deca", Helvetica, Arial, sans-serif',
  headerColor: 'green',
  backgroundColor: "black",
  textColor: 'white',
  isPinUsed: true,
}

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


