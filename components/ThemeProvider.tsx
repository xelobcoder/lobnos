'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
     theme: Theme;
     toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
     const context = useContext(ThemeContext);
     if (context === undefined) {
          throw new Error('useTheme must be used within a ThemeProvider');
     }
     return context;
};

interface ThemeProviderProps {
     children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
     const [theme, setTheme] = useState<Theme>('light');
     const [mounted, setMounted] = useState(false);

     // Initialize theme from localStorage or system preference
     useEffect(() => {
          const savedTheme = localStorage.getItem('theme') as Theme;
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          const initialTheme = savedTheme || systemTheme;

          setTheme(initialTheme);
          setMounted(true);
     }, []);

     // Apply theme to document
     useEffect(() => {
          if (mounted) {
               const root = document.documentElement;
               root.setAttribute('data-bs-theme', theme);
               localStorage.setItem('theme', theme);
          }
     }, [theme, mounted]);

     const toggleTheme = () => {
          setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
     };

     // Prevent hydration mismatch
     if (!mounted) {
          return <>{children}</>;
     }

     return (
          <ThemeContext.Provider value={{ theme, toggleTheme }}>
               {children}
          </ThemeContext.Provider>
     );
};