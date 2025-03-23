'use client';
import React, { useState } from "react";
import { Mylinks } from "./PrimeLinks";
import Link from "next/link";
import styles from './PrimeLayout.module.css';
import { RiSearchLine, RiMenuFoldLine, RiMenuUnfoldLine, RiMoonLine, RiSunLine } from '@remixicon/react';
import { useApplicationSettings } from "../Auth/useApplicationContext";

interface PrimeLayoutProps {
    children: React.ReactNode;
}

const PrimeLayout: React.FC<PrimeLayoutProps> = ({ children }) => {
    const [activeGroup, setActiveGroup] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false); 
    const { company, branchid ,user} = useApplicationSettings().applicationsettings;
    const links = Mylinks(branchid,user.employeeid);

    const handleGroupClick = (index: number) => {
        const currentItem = links[index];
        if (!currentItem.subLinks || currentItem.subLinks.length === 0) {
            if (currentItem.link) {
                window.location.href = currentItem.link;
                return;
            }
        }
        setActiveGroup(activeGroup === index ? null : index);
        setIsSidebarExpanded(activeGroup !== index);
    };

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const filteredLinks = activeGroup !== null && links[activeGroup] ? 
        links[activeGroup].subLinks.filter(link => 
            link.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) : [];

    const hasSublinks = activeGroup !== null && 
        links[activeGroup] && 
        links[activeGroup].subLinks && 
        links[activeGroup].subLinks.length > 0;

    return (
        <div className={`${styles.pageContainer} ${isDarkMode ? styles.darkMode : styles.lightMode}`}>
            <aside className={styles.iconSidebar}>
                <div className={styles.iconHeader}>
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

                <nav className={styles.iconNav}>
                    {Array.isArray(links) && links.map((item, index) => (
                        <div 
                            key={index} 
                            className={`${styles.iconItem} ${activeGroup === index ? styles.active : ''}`}
                            onClick={() => handleGroupClick(index)}
                            title={item.title}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            {hasSublinks && (
                <aside className={`${styles.linksSidebar} ${isSidebarExpanded ? styles.expanded : styles.collapsed}`}>
                    <div className={styles.linksContainer}>
                        <h2 className={styles.linkGroupTitle}>{links[activeGroup].title}</h2>
                        <div className={styles.searchContainer}>
                            <RiSearchLine className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search links..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                        <div className={styles.linksList}>
                            {filteredLinks.map((subLink, index) => (
                                <Link 
                                    key={index}
                                    href={subLink.link}
                                    className={styles.linkItem}
                                >
                                    {subLink.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            )}

            <main className={`${styles.mainContent} ${hasSublinks && isSidebarExpanded ? styles.sidebarExpanded : styles.sidebarCollapsed}`}>
                {children}
            </main>
        </div>
    );
};

export default PrimeLayout;
