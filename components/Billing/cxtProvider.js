import React from 'react';
// create a context

const clientContext = React.createContext();

const ClientContextProvider = clientContext.Provider;
const ClientContextConsumer = clientContext.Consumer;

export { ClientContextConsumer, ClientContextProvider }