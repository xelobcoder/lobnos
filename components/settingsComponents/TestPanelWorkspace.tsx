"use client";
import {createContext,useContext,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {testPanelBasePath} from '../../lib/testPanelNavigation';
const Workspace=createContext<string|null>(null);
export function TestPanelWorkspace({basePath,children}:{basePath:string;children:ReactNode}){return <Workspace.Provider value={basePath}>{children}</Workspace.Provider>;}
export function useTestPanelBasePath(){const base=useContext(Workspace);const pathname=usePathname();return base ?? testPanelBasePath(pathname);}
