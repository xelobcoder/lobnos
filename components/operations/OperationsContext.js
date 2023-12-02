import React, { createContext, useContext } from 'react';
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


    return (
        <>
            {
                auth && (roles.includes(auth?.role)) ?
                    <OperaProvider value={{ operationsKey, updateOperations,employeeid: auth?.employeeid }} >
                        {children}
                    </OperaProvider>
                    :
                <Authorization/>
            }
        </>
    )
}

export default OperationsContext;