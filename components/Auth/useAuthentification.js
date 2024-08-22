import { createContext, useContext, useState } from 'react';
const AuthContext = createContext(null);


const store = {
  security: {
    logout: false
  },
  user: {
    employeeid: null,
    username: null,
    token: null,
    role: null,
  },
  company: 'VITALSCAN LABORATORY AND DIAGNOSTIC CENTRE',
  branchid: null,
  centerid: null,
  synchronize: false,
  lastSynchronizationdate: null,
  isMultiCenterSubscribed: 0,
  result: {
    resultLockAfter24Hours: 1,
    isPinOnResultEntry: 1,
    isPinOnResultViewAfter24Hours: 1,
    maximumResultValidation: 4,
    minimumResultValidation: 1,
    staffQualifiedToValidationResult: [1, 3, 4, 5],
    showPastTestResult: 0,
    allowScientistViewAudit: 1,
    showTaTAnalysis: 0,
    encryptResultAfter24Hours: 1,
    staffToDecryptResult: [],
    sendLoginEmailNotificationAfterResultEdit: 0,
    monitorForCriticalValues: 1,
    notifyClientOnResultReady: 1,
    notificationType: 'Email'
  },
  services: {
    isConnectedInventory: 0,
    isPhysicianOfficeConnected: 0,
    isSupplierConnected: 0,
    isDoctorPortalConnected: 0,
    isResultAnalysisConnected: 0,
    isPatientPortalConnected: 0,
    isSmsServicesConnected: 0,
    isEmailServicesConnected: 0,
  },
  loginDuration: 6,
  daysToExpiration: 40,
  maximumUsers: 3,
  customization: {
    currency: null,
    decimalPlaces: 3,
    fontFamily: '"Lexend Deca", Helvetica, Arial, sans-serif',
    headerColor: 'green',
    backgroundColor: 'black',
    textColor: 'white',
    sidebarColor: null,
    isPinUsed: 0,
    theme: "light",
  }
};

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


