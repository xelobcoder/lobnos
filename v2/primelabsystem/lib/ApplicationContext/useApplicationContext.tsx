"use client"
import { createContext, useContext, useState, ReactNode } from 'react';
import { store, Store } from './store';

interface ApplicationContextType {
  applicationsettings: Store;
  setApplicationSettings: (settings: Store) => void;
}

const ApplicationContext = createContext<ApplicationContextType>({
  applicationsettings: store,
  setApplicationSettings: () => {}
});

interface ApplicationProviderProps {
  children: ReactNode;
}

export const ApplicationProvider = ({ children }: ApplicationProviderProps) => {
  const [applicationsettings, setApplicationSettings] = useState<Store>(store);

  return <ApplicationContext.Provider value={{ applicationsettings, setApplicationSettings }}>{children}</ApplicationContext.Provider>
}

export const useApplicationSettings = (): ApplicationContextType => {
  return useContext(ApplicationContext);
}


