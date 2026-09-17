'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFontPreference, applyFontToDocument } from '../lib/themes';

type Theme = 'light' | 'dark';

interface ThemeContextType {
     theme: Theme;
     toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
     const context = useContext(ThemeContext);
     if (context === undefined) {
          console.warn('useTheme called outside a ThemeProvider; falling back to light theme.');
          return { theme: 'light' as Theme, toggleTheme: () => { } };
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
               // Set default layout structure to sidebar-full
               root.setAttribute('data-layout-structure', 'sidebar-full');
               // Apply saved font preference
               const savedFont = getFontPreference();
               applyFontToDocument(savedFont);
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