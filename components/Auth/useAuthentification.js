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
  company: 'TOP CARE MEDICAL LABORATORY AND CENTRE',
  branchid: null,
  centerid: null,
  synchronize: false,
  lastSynchronizationdate: null,
<<<<<<< HEAD
  headerColor: null,
  sidearColor: null,
  isConnectedInventory: null,
  isSupplierConnected: null,
  loginDuration: null,
  daysToExpiration: 31,
  currency:null,
  decimalPlaces: 3,
}

const ApplicationContext = createContext(store);
=======

}

const ApplicationContext = createContext(store);

>>>>>>> a236a112f54655a5e56c87b3b870b8ab41af3bf4
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


