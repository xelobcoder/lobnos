import { createContext, useContext } from 'react';
import { useState } from 'react';
import AuthContext from '../../components/Auth/useAuthentification';
import Authorization from '../accessories/authorization';

const OperationsContext = createContext();
const OperaProvider = OperationsContext.Provider;

export const OperationsProvider = ({ children }) => {
    const { auth } = useContext(AuthContext);
    const [operationsKey, setOperationsKey] = useState(null);
    const updateOperations = (key) => { setOperationsKey(key); }
    const roles = ['admin', 'manager', 'scientist'];


    const isAuthorized = () => {
        if (!roles.includes(auth?.role)) return <Authorization />
        else return (
            <OperaProvider value={{ operationsKey, updateOperations, employeeid: auth?.employeeid }} >
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