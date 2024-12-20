"use client"
import { createContext, useContext, useState } from 'react';
import { store } from '../../lib/store';

const ApplicationContext = createContext(store);


export const ApplicationProvider = ({ children }) => {
  const [applicationsettings, setApplicationSettings] = useState(store);

  return <ApplicationContext.Provider value={{ applicationsettings, setApplicationSettings }}>{children}</ApplicationContext.Provider>
}


export const useApplicationSettings = () => {
  return useContext(ApplicationContext);
}


