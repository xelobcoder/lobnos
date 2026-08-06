'use client';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from './PrimeLayout.module.css';
import {
    RiMenuLine,
    RiArrowLeftLine,
    RiArrowRightLine,
    RiApps2Line,
    RiUser3Line,
    RiFontSize,
    RiLogoutBoxRLine,
    RiMoonLine,
    RiSunLine,
    RiCloseLine,
    RiShieldCheckLine,
    RiErrorWarningLine,
    RiTimeLine,
} from '@remixicon/react';
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { Link as LinkType } from "./links/types";
import { AdminRoleLinks, FrontdeskRoleLinks, LaboratoryScientistRoleLinks, PhelobotomyRoleLinks, SonographerRoleLinks } from "../FrontPageView/RoleLinks";
import { FontSelector } from "./FontSelector";
import { getFontPreference, applyFontToDocument } from "../../lib/themes";
import { useTheme } from "../ThemeProvider";
import { useRouter, useSearchParams } from 'next/navigation';


interface PrimeLayoutProps {
    children: React.ReactNode;
    links: LinkType[];
}

const PrimeLayout: React.FC<PrimeLayoutProps> = ({ children, links }) => {
    const { company, user, daysToExpiration } = useApplicationSettings().applicationsettings;
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();

    const roleViews = {
        "customer service representative": FrontdeskRoleLinks,
        admin: AdminRoleLinks,
        manager: AdminRoleLinks,
        scientist: LaboratoryScientistRoleLinks,
        sonographer: SonographerRoleLinks,
        phelobotomist: PhelobotomyRoleLinks
    };

    const [isQuickLinksCollapsed, setIsQuickLinksCollapsed] = useState<boolean>(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
    const [isFontSelectorOpen, setIsFontSelectorOpen] = useState<boolean>(false);
    const [isAppsOpen, setIsAppsOpen] = useState<boolean>(false);
    const roleLinks = roleViews[user.role] || [];
    const employeeid = user?.employeeid || 0;
    const [currentPath, setCurrentPath] = useState<string>("");
    const isOpenSideBarShow = useSearchParams().get("isOpenSideBarShow") !== "false";

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    useEffect(() => {
        const savedFont = getFontPreference();
        applyFontToDocument(savedFont);
    }, []);

    useEffect(() => {
        if (daysToExpiration !== undefined && daysToExpiration !== null && daysToExpiration <= 0) {
            router.push("/authentications/license-expired");
        }
    }, [daysToExpiration, router]);

    useEffect(() => {
        if (!isAppsOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsAppsOpen(false);
        };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [isAppsOpen]);

    const handleNavigation = (path: string) => {
        if (window.location.pathname !== path) {
            window.location.href = path;
        }
        setIsMobileSidebarOpen(false);
        setIsAppsOpen(false);
    };

    const licenseInfo = useMemo(() => {
        if (daysToExpiration === undefined || daysToExpiration === null) {
            return null;
        }
        if (daysToExpiration < 0) {
            return {
                tone: 'critical' as const,
                label: 'License expired',
                detail: 'Renewal required',
                Icon: RiErrorWarningLine,
            };
        }
        if (daysToExpiration === 0) {
            return {
                tone: 'critical' as const,
                label: 'Expires today',
                detail: 'License ends today',
                Icon: RiErrorWarningLine,
            };
        }
        if (daysToExpiration <= 7) {
            return {
                tone: 'critical' as const,
                label: `${daysToExpiration} days left`,
                detail: 'License expiring soon',
                Icon: RiErrorWarningLine,
            };
        }
        if (daysToExpiration <= 30) {
            return {
                tone: 'warn' as const,
                label: `${daysToExpiration} days left`,
                detail: 'License renewal window',
                Icon: RiTimeLine,
            };
        }
        return {
            tone: 'ok' as const,
            label: `${daysToExpiration} days left`,
            detail: 'License active',
            Icon: RiShieldCheckLine,
        };
    }, [daysToExpiration]);

    const appsByCategory = useMemo(() => {
        const map = new Map<string, typeof roleLinks>();
        roleLinks.forEach((link) => {
            const cat = (link as { category?: string }).category || 'Applications';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(link);
        });
        return Array.from(map.entries());
    }, [roleLinks]);

    const roleLabel = useMemo(() => {
        const rawRole = user?.role || '';
        if (!rawRole) return 'User';
        return rawRole
            .replace(/[-_]+/g, ' ')
            .split(' ')
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }, [user?.role]);

    const closeApps = useCallback(() => setIsAppsOpen(false), []);

    const renderNavItem = (item: LinkType, isChild: boolean = false) => {
        const uniqueKey = item.title.replace(/\s+/g, '-');
        const isActive = currentPath === item.link;
        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
            return (
                <div key={uniqueKey} className={styles.navSection}>
                    <div className={styles.navGroupLabel} title={item.title}>
                        {item.icon && <span className={styles.navGroupIcon}>{item.icon}</span>}
                        <span className={styles.navGroupText}>{item.title}</span>
                    </div>
                    {item.children && (
                        <div className={styles.navSubmenu} role="group" aria-label={item.title}>
                            {item.children.map(child => renderNavItem(child, true))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <button
                key={uniqueKey}
                type="button"
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''} ${isChild ? styles.navItemChild : ''}`}
                onClick={() => handleNavigation(item.link)}
                aria-current={isActive ? 'page' : undefined}
                title={item.title}
            >
                {item.icon && <span className={styles.navIcon}>{item.icon}</span>}
                <span className={styles.navLabel}>{item.title}</span>
            </button>
        );
    };

    return (
        <div className={`${styles.container} ${isQuickLinksCollapsed ? styles.quickLinksCollapsed : styles.quickLinksExpanded} ${isMobileSidebarOpen ? styles.mobileSidebarOpen : ''}`}>
            <header className={styles.darkHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        {isOpenSideBarShow && (
                            <button
                                type="button"
                                className={`${styles.sidebarToggleHeader} d-none d-md-inline-flex`}
                                onClick={() => setIsQuickLinksCollapsed(!isQuickLinksCollapsed)}
                                title={isQuickLinksCollapsed ? "Expand navigation" : "Collapse navigation"}
                                aria-label={isQuickLinksCollapsed ? "Expand navigation" : "Collapse navigation"}
                                aria-expanded={!isQuickLinksCollapsed}
                            >
                                {isQuickLinksCollapsed ? <RiArrowRightLine size={16} /> : <RiArrowLeftLine size={16} />}
                            </button>
                        )}
                        <button
                            type="button"
                            className={styles.mobileMenuButton}
                            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            <RiMenuLine size={20} />
                        </button>

                        <div className={styles.brandBlock}>
                            <div className={styles.companyRow}>
                                <h1 className={styles.companyName} title={company || ''}>
                                    {company || 'Organization'}
                                </h1>
                            </div>
                            <div className={styles.sessionMeta}>
                                {user?.username ? (
                                    <span className={styles.sessionUser} title={`${user.username}(${roleLabel})`}>
                                        <span>{user.username}</span>
                                        <span className={styles.userRoleInline}>({roleLabel})</span>
                                    </span>
                                ) : (
                                    <span className={styles.sessionUser}>User session active</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.headerCenter}>
                        <button
                            type="button"
                            className={styles.appsLauncherBtn}
                            onClick={() => setIsAppsOpen(true)}
                            aria-haspopup="dialog"
                            aria-expanded={isAppsOpen}
                        >
                            <RiApps2Line size={16} />
                            <span className={styles.appsLauncherLabel}>Apps</span>
                        </button>
                    </div>

                    <div className={styles.headerActions}>
                        <div className={styles.headerIconGroup} role="toolbar" aria-label="Account actions">
                            {licenseInfo ? (
                                <span
                                    className={`${styles.licenseInline} ${styles[`license_${licenseInfo.tone}`]}`}
                                    title={`${licenseInfo.detail}: ${licenseInfo.label}`}
                                >
                                    <licenseInfo.Icon size={13} className={styles.licenseInlineIcon} />
                                    <span className={styles.licenseInlineLabel}>License</span>
                                    <span className={styles.licenseInlineValue}>{licenseInfo.label}</span>
                                </span>
                            ) : null}
                            <button
                                type="button"
                                className={styles.headerIconBtn}
                                onClick={() => handleNavigation(`/human-resource/profile?employeeid=${employeeid}`)}
                                title="Profile"
                                aria-label="Open profile"
                            >
                                <RiUser3Line size={17} />
                            </button>
                            <button
                                type="button"
                                className={styles.headerIconBtn}
                                onClick={() => setIsFontSelectorOpen(true)}
                                title="Font"
                                aria-label="Change font"
                            >
                                <RiFontSize size={17} />
                            </button>
                            <button
                                type="button"
                                className={styles.headerIconBtn}
                                onClick={toggleTheme}
                                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                            >
                                {theme === 'light' ? <RiMoonLine size={17} /> : <RiSunLine size={17} />}
                            </button>
                            <span className={styles.headerIconDivider} aria-hidden="true" />
                            <a
                                href="/authentication/logout"
                                className={`${styles.headerIconBtn} ${styles.headerIconLogout}`}
                                title="Logout"
                                aria-label="Log out"
                            >
                                <RiLogoutBoxRLine size={17} />
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.twoColumnLayout} style={!isOpenSideBarShow ? { width: '100%' } : {}}>
                {isMobileSidebarOpen && <div className={styles.mobileOverlay} onClick={() => setIsMobileSidebarOpen(false)} />}

                {isOpenSideBarShow && (
                    <aside className={`${styles.quickLinksSidebar} ${isMobileSidebarOpen ? styles.mobileSidebarVisible : ''}`}>
                        <nav className={styles.sidebarNav} aria-label="Section navigation">
                            {Array.isArray(links) && links.map(item => renderNavItem(item))}
                        </nav>
                    </aside>
                )}
                <main className={styles.mainContent} style={!isOpenSideBarShow ? { margin: 0, padding: 0 } : {}}>
                    <div className={styles.contentWrapper} style={!isOpenSideBarShow ? { padding: 0, margin: '10px', maxWidth: '100%' } : {}}>
                        {children}
                    </div>
                </main>
            </div>

            {isAppsOpen && (
                <div className={styles.appsOverlay} role="presentation" onClick={closeApps}>
                    <div
                        className={styles.appsModal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="apps-launcher-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.appsModalHeader}>
                            <div className={styles.appsModalHeading}>
                                <span className={styles.appsModalKicker}>Workspace</span>
                                <h3 id="apps-launcher-title" className={styles.appsModalTitle}>Applications</h3>
                                <p className={styles.appsModalSubtitle}>
                                    Open a module available for your role
                                    {user?.role ? ` (${user.role})` : ''}.
                                </p>
                            </div>
                            <button
                                type="button"
                                className={styles.appsModalClose}
                                onClick={closeApps}
                                aria-label="Close applications"
                            >
                                <RiCloseLine size={20} />
                            </button>
                        </div>

                        <div className={styles.appsModalBody}>
                            {appsByCategory.length === 0 ? (
                                <div className={styles.appsEmpty}>No applications available for this role.</div>
                            ) : (
                                appsByCategory.map(([category, items]) => (
                                    <section key={category} className={styles.appsCategory}>
                                        <h4 className={styles.appsCategoryTitle}>{category}</h4>
                                        <div className={styles.appsGrid}>
                                            {items.map((link, index) => {
                                                const disabled = Boolean((link as { disabled?: boolean }).disabled);
                                                const description =
                                                    (link as { description?: string }).description ||
                                                    (link as { text?: string }).text ||
                                                    '';
                                                const content = (
                                                    <>
                                                        <span className={styles.appsTileIcon}>{link.icon}</span>
                                                        <span className={styles.appsTileBody}>
                                                            <span className={styles.appsTileLabel}>{link.label}</span>
                                                            {description ? (
                                                                <span className={styles.appsTileDesc}>{description}</span>
                                                            ) : null}
                                                        </span>
                                                    </>
                                                );
                                                if (disabled) {
                                                    return (
                                                        <div
                                                            key={`${category}-${index}`}
                                                            className={`${styles.appsTile} ${styles.appsTileDisabled}`}
                                                            aria-disabled="true"
                                                            title="Unavailable"
                                                        >
                                                            {content}
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <a
                                                        key={`${category}-${index}`}
                                                        href={link.href}
                                                        className={styles.appsTile}
                                                        onClick={() => setIsAppsOpen(false)}
                                                    >
                                                        {content}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <FontSelector
                isOpen={isFontSelectorOpen}
                onClose={() => setIsFontSelectorOpen(false)}
            />
        </div>
    );
};

export default PrimeLayout;
