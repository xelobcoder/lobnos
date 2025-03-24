"use client"
import { createContext, useContext, useState, ReactNode } from "react";

type ApplicationContextType = {
    user: string;
    theme: string;
    isAuthenticated: boolean;
    employeeid: number;
};

const defaultApplicationContext: ApplicationContextType = {
    user: 'Tiifu Hamza Kojo Boronson',
    theme: "light",
    isAuthenticated: false,
    employeeid:3
};

const ApplicationContext = createContext<ApplicationContextType>(defaultApplicationContext);


export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
    const [application, setApplication] = useState<ApplicationContextType>({
        ...defaultApplicationContext
    });

    const updateApplicationState = (value: ApplicationContextType | any) => {
        setApplication(value);
    }

    const value = { ...application, updateApplicationState };

    return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
};


export const useApplication = () => useContext(ApplicationContext);