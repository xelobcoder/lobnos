import { createContext} from 'react';
import { useState } from 'react';
import Authorization from '../accessories/authorization';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import { roleAllowed } from '../Auth/roles';

const OperationsContext = createContext();
const OperaProvider = OperationsContext.Provider;

export const OperationsProvider = ({ children }) => {
    const { user } = useApplicationSettings().applicationsettings;
    const employeeid = user?.employeeid;
    const [operationsKey, setOperationsKey] = useState(null);
    const updateOperations = (key) => { setOperationsKey(key); }
    const roles = ['admin', 'super-admin', 'manager', 'scientist'];


    const isAuthorized = () => {
        if (!roleAllowed(user?.role, roles)) return <Authorization />
        else return (
            <OperaProvider value={{ operationsKey, updateOperations, employeeid: employeeid }} >
                {children}
            </OperaProvider>
        )
    }


    return (
        <>
          {isAuthorized()}
        </>
    )
}

export default OperationsContext;