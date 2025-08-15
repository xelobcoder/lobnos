'use client';
import React, { useState, useEffect } from "react";
import styles from './PrimeLayout.module.css';
import {
    RiMenuFoldLine,
    RiMenuUnfoldLine,
    RiMoonLine,
    RiSunLine,
    RiHomeLine
} from '@remixicon/react';
import { Dropdown } from 'react-bootstrap';
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { Link as LinkType } from "./links/types";

interface PrimeLayoutProps {
    children: React.ReactNode;
    links: LinkType[];
}

const PrimeLayout: React.FC<PrimeLayoutProps> = ({ children, links }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const { company, user } = useApplicationSettings().applicationsettings;

    const employeeid = user?.employeeid || 0;
    const [currentPath, setCurrentPath] = useState<string>("");

    useEffect(() => {
        setCurrentPath(window.location.pathname + window.location.search + window.location.hash);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
        }

        const savedSidebarState = localStorage.getItem('sidebarExpanded');
        if (savedSidebarState !== null) {
            setIsSidebarExpanded(savedSidebarState === 'true');
        }
    }, []);

    const handleNavigation = (path: string) => {
        if (window.location.pathname + window.location.search + window.location.hash !== path) {
            window.location.href = path;
        }
    };

    const toggleSidebar = () => {
        setIsSidebarExpanded(prev => {
            const newState = !prev;
            localStorage.setItem('sidebarExpanded', String(newState));
            return newState;
        });
    };


    const renderNavItem = (item: LinkType) => {
        const uniqueKey = item.title.replace(/\s+/g, '-');
        const isActive = currentPath === item.link;

        const handleClick = () => {
            handleNavigation(item.link);
        };

        return (
            <div
                key={uniqueKey}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={handleClick}
                title={!isSidebarExpanded ? item.title : undefined}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
            >
                {item.icon && <span className={styles.icon}>{item.icon}</span>}
                {isSidebarExpanded && <span className={styles.title}>{item.title}</span>}
            </div>
        );
    };


    const homeLink: LinkType = {
        title: "Home",
        link: "/",
        icon: <RiHomeLine />
    };


    return (
        <div className={`
            ${styles.pageContainer} 
            ${isDarkMode ? styles.darkMode : styles.lightMode} 
            ${isSidebarExpanded ? styles.sidebarActuallyExpanded : styles.sidebarActuallyCollapsed}
        `}>
            <header
                className={styles.header}

            >
                <div className={styles.headerContent}>
                    <h1>{company || "Prime Laboratory System(PLS)"}</h1>
                    <div className={styles.headerControls}>
                        <div className={styles.userInfo}>
                            <span>{user?.username || "User"}</span>
                            <span className={styles.role}>{user?.role || "Role"}</span>
                        </div>
                        <Dropdown align="end">
                            <Dropdown.Toggle as="div" className={styles.userAvatar} id="user-avatar-dropdown" style={{ cursor: 'pointer' }}>
                                {(user?.username?.charAt(0) || 'U').toUpperCase()}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item href={`/human-resource/profile?employeeid=${employeeid}`}>Profile</Dropdown.Item>
                                <Dropdown.Item href="/settings">Settings</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item href="/authentication/logout">
                                    Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </header>

            <aside
                className={styles.sidebar}
            >
                <div className={styles.sidebarHeader}>
                    <div className={styles.companyIcon}>
                        {(company?.name?.charAt(0) || 'C').toUpperCase()}
                    </div>
                    {isSidebarExpanded && <span className={styles.sidebarCompanyName}>{company}</span>}
                    <div className={styles.sidebarToggleButtons}>
                        <button
                            onClick={toggleSidebar}
                            className={styles.sidebarActionButton}
                            aria-label={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                        >
                            {isSidebarExpanded ? <RiMenuFoldLine size={20} /> : <RiMenuUnfoldLine size={20} />}
                        </button>
                    </div>
                </div>

                <nav className={`${styles.sidebarNav}`}>
                    {renderNavItem(homeLink)}
                    {Array.isArray(links) && links.map(item => renderNavItem(item))}
                </nav>

                <div className={styles.sidebarFooter}>
                    {isSidebarExpanded && <span className={styles.footerText}>PLS(version 0.02 Barakah)</span>}
                    {!isSidebarExpanded && <span className={styles.footerIconPlaceholder}></span>}
                </div>
            </aside>

            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default PrimeLayout;