import React, { createContext } from 'react';
// create a context
const TestContext = createContext();
// create a provider
const TestProvider = TestContext.Provider;

export const TestPanelProvider = ({ children }) => {
    const [testvalue, setValue] = React.useState({});
    const updateValue = (value) => { setValue(value); }

    return (
        <>
          <TestProvider value ={{testvalue,updateValue}}>
              {children}
          </TestProvider>
        </>
    )
}


export default TestContext;