'use client';
import React, { useState } from "react";
import styles from './PrimeLayout.module.css';
import { RiMenuFoldLine, RiMenuUnfoldLine, RiMoonLine, RiSunLine, RiHomeLine } from '@remixicon/react';
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { Link } from "./links/types";

interface PrimeLayoutProps {
    children: React.ReactNode;
    links:Link[]
}

const PrimeLayout: React.FC<PrimeLayoutProps> = ({ children, links }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const { company,user } = useApplicationSettings().applicationsettings;

    const handleGroupClick = (link: string | undefined) => {
        if (link) {
            window.location.href = link;
        }
    };

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>{company}</h1>
                    <div className={styles.userInfo}>
                        <span>{user.username}</span>
                        <span className={styles.role}>{user.role}</span>
                    </div>
                </div>
            </header>
            <aside className={`${styles.sidebar} ${isSidebarExpanded ? styles.expanded : styles.collapsed}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.companyIcon}>
                        {company?.name?.charAt(0)}
                    </div>
                    <button onClick={toggleSidebar} className={styles.toggleButton}>
                        {isSidebarExpanded ? <RiMenuFoldLine /> : <RiMenuUnfoldLine />}
                    </button>
                    <button onClick={toggleDarkMode} className={styles.toggleButton}>
                        {isDarkMode ? <RiSunLine /> : <RiMoonLine />}
                    </button>
                </div>

                <nav className={styles.sidebarNav}>
                    <div
                        className={styles.navItem}
                        onClick={() => handleGroupClick('/')} 
                        title="Home"
                    >
                        <span className={styles.icon}><RiHomeLine /></span> 
                        {isSidebarExpanded && (
                            <span className={styles.title}>Home</span>
                        )}
                    </div>
                    {/* Existing links */}
                    {Array.isArray(links) && links.map((item, index) => (
                        <div 
                            key={index} 
                            className={styles.navItem}
                            onClick={() => handleGroupClick(item.link)}
                            title={item.title}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            {isSidebarExpanded && (
                                <span className={styles.title}>{item.title}</span>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>

            <main  className={`${styles.mainContent} ${isSidebarExpanded ? styles.sidebarExpanded : styles.sidebarCollapsed}`}>
                <div className="p-4">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default PrimeLayout;
