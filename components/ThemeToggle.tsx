'use client';

import React from 'react';
import { RiSunLine, RiMoonLine } from '@remixicon/react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
     className?: string;
     size?: number;
     showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
     className = '',
     size = 20,
     showLabel = false
}) => {
     const { theme, toggleTheme } = useTheme();

     return (
          <button
               onClick={toggleTheme}
               className={`btn btn-link text-decoration-none p-2 ${className}`}
               title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
               style={{ border: 'none', background: 'transparent' }}
          >
               {theme === 'light' ? (
                    <RiMoonLine size={size} />
               ) : (
                    <RiSunLine size={size} />
               )}
               {showLabel && (
                    <span className="ms-2 d-none d-sm-inline">
                         {theme === 'light' ? 'Dark' : 'Light'} Mode
                    </span>
               )}
          </button>
     );
};