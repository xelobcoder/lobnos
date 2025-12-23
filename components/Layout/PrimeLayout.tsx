'use client';
import React, { useState, useEffect } from "react";
import styles from './PrimeLayout.module.css';
import { RiMenuLine, RiArrowLeftLine, RiArrowRightLine, RiAddLine, RiSubtractLine } from '@remixicon/react';
import { Dropdown } from 'react-bootstrap';
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { Link as LinkType } from "./links/types";
import { AdminRoleLinks, FrontdeskRoleLinks, LaboratoryScientistRoleLinks, PhelobotomyRoleLinks, SonographerRoleLinks } from "../FrontPageView/RoleLinks";
import { FontSelector } from "./FontSelector";
import { getFontPreference, applyFontToDocument } from "../../lib/themes";
import { useTheme } from "../ThemeProvider";


interface PrimeLayoutProps {
    children: React.ReactNode;
    links: LinkType[];
}

const PrimeLayout: React.FC<PrimeLayoutProps> = ({ children, links }) => {
    const { company, user } = useApplicationSettings().applicationsettings;
    const { theme, toggleTheme } = useTheme();

    const roleViews = {
        "customer service representative": FrontdeskRoleLinks,
        admin: AdminRoleLinks,
        manager: AdminRoleLinks,
        scientist: LaboratoryScientistRoleLinks,
        sonographer: SonographerRoleLinks,
        phelobotomist: PhelobotomyRoleLinks
    };

    const [isQuickLinksCollapsed, setIsQuickLinksCollapsed] = useState<boolean>(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
    const [isAppsExpanded, setIsAppsExpanded] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isFontSelectorOpen, setIsFontSelectorOpen] = useState<boolean>(false);
    const roleLinks = roleViews[user.role] || [];
    const employeeid = user?.employeeid || 0;
    const [currentPath, setCurrentPath] = useState<string>("");

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    // Apply saved font preference on mount
    useEffect(() => {
        const savedFont = getFontPreference();
        applyFontToDocument(savedFont);
    }, []);

    const handleNavigation = (path: string) => {
        if (window.location.pathname !== path) {
            window.location.href = path;
        }
        // Close mobile sidebar after navigation
        setIsMobileSidebarOpen(false);
    };


    const toggleGroup = (groupTitle: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupTitle)) {
                newSet.delete(groupTitle);
            } else {
                newSet.add(groupTitle);
            }
            return newSet;
        });
    };

    const renderNavItem = (item: LinkType, isChild: boolean = false) => {
        const uniqueKey = item.title.replace(/\s+/g, '-');
        const isActive = currentPath === item.link;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedGroups.has(item.title);

        if (hasChildren) {
            return (
                <div key={uniqueKey} className={styles.navSection}>
                    <button
                        className={styles.navGroupButton}
                        onClick={() => toggleGroup(item.title)}
                        aria-expanded={isExpanded}
                    >
                        {item.icon && <span className={styles.navIcon}>{item.icon}</span>}
                        <span className={styles.navLabel}>{item.title}</span>
                        <span className={styles.navExpandIcon}>
                            {isExpanded ? <RiSubtractLine size={12} /> : <RiAddLine size={12} />}
                        </span>
                    </button>
                    {isExpanded && item.children && (
                        <div className={styles.navSubmenu}>
                            {item.children.map(child => renderNavItem(child, true))}
                        </div>
                    )}
                </div>
            );
        } else {
            const handleClick = () => {
                handleNavigation(item.link);
            };

            return (
                <button
                    key={uniqueKey}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''} ${isChild ? styles.navItemChild : ''}`}
                    onClick={handleClick}
                    aria-current={isActive ? 'page' : undefined}
                >
                    {item.icon && <span className={styles.navIcon}>{item.icon}</span>}
                    <span className={styles.navLabel}>{item.title}</span>
                </button>
            );
        }
    };


    return (
        <div className={`${styles.container} ${isQuickLinksCollapsed ? styles.quickLinksCollapsed : styles.quickLinksExpanded} ${isMobileSidebarOpen ? styles.mobileSidebarOpen : ''}`}>
            {/* Header with PLS Green Background */}
            <header className={styles.darkHeader}>
                <div className={styles.headerContent}>
                    {/* Company Info */}
                    <div className={styles.headerCompany}>
                        <h2 className={styles.companyName}>
                            {company}
                        </h2>
                    </div>

                    {/* Role Links Dropdown */}
                    <div className={styles.headerActions}>
                        <div className="d-none d-md-flex flex-column align-items-end me-2" style={{ lineHeight: '1.2' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.username}({user?.role})</span>

                        </div>
                        <button
                            className={styles.themeToggle}
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        <a href={`/human-resource/profile?employeeid=${employeeid}`} className={styles.profileLink} title="Profile">
                            <span>👤</span>
                        </a>
                        <button
                            className={styles.fontSelectorButton}
                            onClick={() => setIsFontSelectorOpen(true)}
                            title="Change Font"
                            aria-label="Change application font"
                        >
                            <span>🔤</span>
                        </button>
                        <button
                            className={styles.mobileMenuButton}
                            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            <RiMenuLine />
                        </button>
                        <Dropdown>
                            <Dropdown.Toggle id="role-links-dropdown" variant="outline-light" className={styles.roleDropdownToggle}>
                                <RiMenuLine />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className={styles.roleDropdownMenu}>
                                {/* Quick Apps Section */}
                                <div className={styles.dropdownSection}>
                                    <div className={styles.dropdownSectionTitle}>Quick Apps</div>
                                    <div className={styles.dropdownGrid}>
                                        {roleLinks.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.href}
                                                className={styles.dropdownGridItem}
                                            >
                                                <span className={styles.dropdownGridIcon}>{link.icon}</span>
                                                <span className={styles.dropdownGridLabel}>{link.label}</span>
                                            </a>
                                        ))}
                                        <a
                                            href="/human-resource/payroll"
                                            className={styles.dropdownGridItem}
                                        >
                                            <span className={styles.dropdownGridIcon}>💰</span>
                                            <span className={styles.dropdownGridLabel}>Payroll</span>
                                        </a>
                                    </div>
                                </div>

                                <Dropdown.Divider />

                                {/* Account Section */}
                                <div className={styles.dropdownSection}>
                                    <div className={styles.dropdownSectionTitle}>Account</div>
                                    <Dropdown.Item
                                        onClick={() => setIsFontSelectorOpen(true)}
                                        className={styles.roleDropdownItem}
                                    >
                                        <span className={styles.dropdownIcon}>🔤</span>
                                        <span>
                                            <div className={styles.dropdownItemTitle}>Font</div>
                                            <div className={styles.dropdownItemSubtitle}>Change application font</div>
                                        </span>
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/settings" className={styles.roleDropdownItem}>
                                        <span className={styles.dropdownIcon}>⚙️</span>
                                        <span>
                                            <div className={styles.dropdownItemTitle}>Settings</div>
                                            <div className={styles.dropdownItemSubtitle}>Preferences & configuration</div>
                                        </span>
                                    </Dropdown.Item>
                                </div>

                                <Dropdown.Divider />

                                {/* Logout */}
                                <Dropdown.Item href="/authentication/logout" className={`${styles.roleDropdownItem} ${styles.logoutItem}`}>
                                    <span className={styles.dropdownIcon}>🚪</span>
                                    Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </header>

            {/* Two Column Layout: Sidebar + Main Content */}
            <div className={styles.twoColumnLayout}>
                {/* Mobile Overlay */}
                {isMobileSidebarOpen && <div className={styles.mobileOverlay} onClick={() => setIsMobileSidebarOpen(false)}></div>}

                {/* First Column: Quick Links Sidebar */}
                <aside className={`${styles.quickLinksSidebar} ${isMobileSidebarOpen ? styles.mobileSidebarVisible : ''}`}>
                    <div className={styles.sidebarHeader}>
                        <h3 className={styles.sidebarTitle}>Quick Links</h3>
                        <button
                            className={styles.sidebarActionButton}
                            onClick={() => setIsQuickLinksCollapsed(!isQuickLinksCollapsed)}
                            title={isQuickLinksCollapsed ? "Expand Quick Links" : "Collapse Quick Links"}
                        >
                            {isQuickLinksCollapsed ? <RiArrowRightLine size={16} /> : <RiArrowLeftLine size={16} />}
                        </button>
                    </div>

                    <nav className={styles.sidebarNav} aria-label="Quick Links Navigation">
                        {Array.isArray(links) && links.map(item => renderNavItem(item))}

                        {/* Apps Section - Only show on mobile */}
                        {isMobile && (
                            <div className={styles.navSection}>
                                <button
                                    className={styles.navGroupButton}
                                    onClick={() => setIsAppsExpanded(!isAppsExpanded)}
                                    aria-expanded={isAppsExpanded}
                                >
                                    <span className={styles.navIcon}>📱</span>
                                    <span className={styles.navLabel}>Apps</span>
                                    <span className={styles.navExpandIcon}>
                                        {isAppsExpanded ? <RiSubtractLine size={12} /> : <RiAddLine size={12} />}
                                    </span>
                                </button>
                                {isAppsExpanded && (
                                    <div className={styles.navSubmenu}>
                                        {roleLinks.map((link, index) => (
                                            <button
                                                key={`app-${index}`}
                                                className={`${styles.navItem} ${styles.navItemChild}`}
                                                onClick={() => {
                                                    window.location.href = link.href;
                                                    setIsMobileSidebarOpen(false);
                                                }}
                                            >
                                                <span className={styles.navIcon}>{link.icon}</span>
                                                <span className={styles.navLabel}>{link.label}</span>
                                            </button>
                                        ))}
                                        <button
                                            className={`${styles.navItem} ${styles.navItemChild}`}
                                            onClick={() => {
                                                window.location.href = `/human-resource/profile?employeeid=${employeeid}`;
                                                setIsMobileSidebarOpen(false);
                                            }}
                                        >
                                            <span className={styles.navIcon}>👤</span>
                                            <span className={styles.navLabel}>Profile</span>
                                        </button>
                                        <button
                                            className={`${styles.navItem} ${styles.navItemChild}`}
                                            onClick={() => {
                                                window.location.href = "/settings";
                                                setIsMobileSidebarOpen(false);
                                            }}
                                        >
                                            <span className={styles.navIcon}>⚙️</span>
                                            <span className={styles.navLabel}>Settings</span>
                                        </button>
                                        <button
                                            className={`${styles.navItem} ${styles.navItemChild}`}
                                            onClick={() => {
                                                window.location.href = "/authentication/logout";
                                                setIsMobileSidebarOpen(false);
                                            }}
                                        >
                                            <span className={styles.navIcon}>🚪</span>
                                            <span className={styles.navLabel}>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </aside>
                <main className={styles.mainContent}>
                    <div className={styles.contentWrapper}>
                        {children}
                    </div>
                </main>
            </div>
            <FontSelector
                isOpen={isFontSelectorOpen}
                onClose={() => setIsFontSelectorOpen(false)}
            />
        </div>
    );
};

export default PrimeLayout;