import React, { createContext } from 'react';
import { useState } from 'react';

const OperationsContext = createContext();

const OperaProvider = OperationsContext.Provider;

export const OperationsProvider = ({ children }) => {
    const [operationsKey, setOperationsKey] = useState(null);
    const updateOperations = (key) => { setOperationsKey(key);}

    return (
        <>
            <OperaProvider value={{operationsKey, updateOperations}} >
                {children}
            </OperaProvider>
        </>
    )
}

export default OperationsContext;