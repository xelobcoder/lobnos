'use client';
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import styles from './PrimeLayout.module.css';
import { RiMenuLine, RiArrowLeftLine, RiArrowRightLine } from '@remixicon/react';
import { Dropdown } from 'react-bootstrap';
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { Link as LinkType } from "./links/types";
import { AdminRoleLinks, FrontdeskRoleLinks, LaboratoryScientistRoleLinks, PhelobotomyRoleLinks, SonographerRoleLinks } from "../FrontPageView/RoleLinks";


interface PrimeLayoutProps {
    children: React.ReactNode;
    links: LinkType[];
}

const PrimeLayout: React.FC<PrimeLayoutProps> = ({ children, links }) => {
    const { company, user } = useApplicationSettings().applicationsettings;

    const roleViews = {
        "customer service representative": FrontdeskRoleLinks,
        admin: AdminRoleLinks,
        manager: AdminRoleLinks,
        scientist: LaboratoryScientistRoleLinks,
        sonographer: SonographerRoleLinks,
        phelobotomist: PhelobotomyRoleLinks
    };

    const [isRoleExpanded, setIsRoleExpanded] = useState<boolean>(false);
    const [isQuickLinksCollapsed, setIsQuickLinksCollapsed] = useState<boolean>(false);
    const roleLinks = roleViews[user.role] || [];
    const employeeid = user?.employeeid || 0;
    const [currentPath, setCurrentPath] = useState<string>("");

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    const handleNavigation = (path: string) => {
        if (window.location.pathname !== path) {
            window.location.href = path;
        }
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
                className={`list-group-item d-flex mx-2 ${isActive ? 'active' : ''}`}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
            >
                {item.icon && <span className={styles.icon}>{item.icon}</span>}
                <span className={styles.title}>{item.title}</span>
            </div>
        );
    };


    return (
        <div className={`${styles.gmailContainer} ${isRoleExpanded ? styles.roleExpanded : styles.roleCollapsed} ${isQuickLinksCollapsed ? styles.quickLinksCollapsed : styles.quickLinksExpanded}`}>
            {/* First Column: Role Component (Gmail-style narrow sidebar) */}
            <aside className={styles.roleSidebar}>
                <div className={styles.roleHeader}>
                    <button
                        className={styles.roleToggleButton}
                        onClick={() => setIsRoleExpanded(!isRoleExpanded)}
                        title="Toggle Role Panel"
                    >
                        <RiMenuLine size={20} />
                    </button>
                </div>

                <nav className={styles.roleNav}>
                    {roleLinks.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className={styles.roleNavItem}
                            title={link.label}
                        >
                            <div className={styles.roleNavIcon}>
                                {link.icon}
                            </div>
                            {isRoleExpanded && (
                                <div className={styles.roleNavLabel}>
                                    {link.label}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User Avatar in First Column */}
                <div className={styles.roleUserSection}>
                    <Dropdown align="end">
                        <Dropdown.Toggle as="div" className={styles.roleUserAvatar} id="role-user-avatar-dropdown" style={{ cursor: 'pointer' }}>
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
                    {isRoleExpanded && (
                        <div className={styles.roleUserInfo}>
                            <span className={styles.roleUserName}>{user?.username || "User"}</span>
                            <span className={styles.roleUserRole}>{user?.role || "Role"}</span>
                        </div>
                    )}
                </div>
            </aside>

            {/* Second Column: Quick Links Sidebar */}
            <aside className={styles.quickLinksSidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.companySection}>
                        <div className={styles.companyIcon}>
                            {(company?.name?.charAt(0) || 'C').toUpperCase()}
                        </div>
                        <h2 className={styles.companyName}>
                            {(() => {
                                const companyName = company || 'Company';
                                return companyName.length > 10
                                    ? companyName.substring(0, 15) + '...'
                                    : companyName;
                            })()}
                        </h2>
                    </div>
                    <div className={styles.sidebarToggleButtons}>
                        <button
                            className={styles.sidebarActionButton}
                            onClick={() => setIsQuickLinksCollapsed(!isQuickLinksCollapsed)}
                            title={isQuickLinksCollapsed ? "Expand Quick Links" : "Collapse Quick Links"}
                        >
                            {isQuickLinksCollapsed ? <RiArrowRightLine size={16} /> : <RiArrowLeftLine size={16} />}
                        </button>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className="list-group">
                        {Array.isArray(links) && links.map(item => renderNavItem(item))}
                    </div>
                </nav>
            </aside>

            {/* Third Column: Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default PrimeLayout;