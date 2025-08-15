"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { store } from "../../lib/store";

const ApplicationContext = createContext(store);

export const ApplicationProvider = ({ children }) => {
  const [applicationsettings, setApplicationSettings] = useState(null);

  return (
    <ApplicationContext.Provider value={{ applicationsettings, setApplicationSettings }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationSettings = () => {
  return useContext(ApplicationContext);
};

export const useApplication = () => {
  return useApplicationSettings().applicationsettings;
};
