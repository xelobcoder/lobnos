'use client';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from './PrimeLayout.module.css';
import {
    RiMenuLine,
    RiMenu3Line,
    RiArrowLeftLine,
    RiArrowRightLine,
    RiUser3Line,
    RiFontSize,
    RiLogoutBoxRLine,
    RiMoonLine,
    RiSunLine,
    RiCloseLine,
    RiShieldCheckLine,
    RiErrorWarningLine,
    RiTimeLine,
    RiNotification3Line,
} from '@remixicon/react';
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { Link as LinkType } from "./links/types";
import { navigationPages, superAdminNavigation } from "./links/SuperAdminLinks";
import { AccountantRoleLinks, AdminRoleLinks, FrontdeskRoleLinks, LaboratoryScientistRoleLinks, PhelobotomyRoleLinks, SonographerRoleLinks } from "../FrontPageView/RoleLinks";
import { FontSelector } from "./FontSelector";
import { getFontPreference, applyFontToDocument } from "../../lib/themes";
import { useTheme } from "../ThemeProvider";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { customFetch, customFetchMutation } from '../Auth/customFetch';
import { canAccessFacilityModule } from '../../lib/facilityModuleAccess';


interface PrimeLayoutProps {
    children: React.ReactNode;
    links: LinkType[];
}

const PrimeLayout: React.FC<PrimeLayoutProps> = ({ children, links }) => {
    const { company, user, daysToExpiration, settings } = useApplicationSettings().applicationsettings;
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const modulePath = usePathname();

    const roleViews = {
        "customer service representative": FrontdeskRoleLinks,
        admin: AdminRoleLinks,
        manager: AdminRoleLinks,
        scientist: LaboratoryScientistRoleLinks,
        sonographer: SonographerRoleLinks,
        accountant: AccountantRoleLinks,
        phelobotomist: PhelobotomyRoleLinks
    };

    const [isQuickLinksCollapsed, setIsQuickLinksCollapsed] = useState<boolean>(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
    const [isFontSelectorOpen, setIsFontSelectorOpen] = useState<boolean>(false);
    const [isAppsOpen, setIsAppsOpen] = useState<boolean>(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const normalizedRole = String(user?.role || '').toLowerCase().trim().replace(/_/g, '-');
    const isSuperAdmin = normalizedRole.replace(/[\s-]/g, '') === 'superadmin';
    const allNavigation = useMemo(() => isSuperAdmin ? superAdminNavigation(Number(user?.branch || 0), Number(user?.employeeid || 0)) : [], [isSuperAdmin, user?.branch, user?.employeeid]);
    const roleLinks = isSuperAdmin ? navigationPages(allNavigation) : (roleViews[user.role] || []).filter(item => canAccessFacilityModule(item.link || "", settings?.moduleConfiguration));
    const visibleLinks = useMemo(() => {
        const filterLinks = (items: LinkType[]): LinkType[] => items
            .filter((item) => isSuperAdmin || !item.roles || item.roles.some((role) => role.replace(/_/g, '-').toLowerCase() === normalizedRole))
            .filter((item) => isSuperAdmin || canAccessFacilityModule(item.link || "", settings?.moduleConfiguration))
            .map((item) => ({
                ...item,
                children: item.children ? filterLinks(item.children) : item.children,
            }))
            .filter((item) => !item.children || item.children.length > 0 || item.link);

        return filterLinks(isSuperAdmin ? allNavigation : links || []);
    }, [links, normalizedRole, isSuperAdmin, allNavigation, settings?.moduleConfiguration]);
    const canViewNotifications = ['admin', 'manager', 'super-admin', 'super admin'].includes(String(user?.role || '').toLowerCase().trim());
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

    useEffect(() => {
        if (!canViewNotifications) return;
        let active = true;
        const loadNotifications = async () => {
            try {
                const [inboxResponse, countResponse] = await Promise.all([
                    customFetch('notifications/inbox?limit=10'),
                    customFetch('notifications/inbox/unread-count'),
                ]);
                if (!active) return;
                if (Array.isArray(inboxResponse?.result)) setNotifications(inboxResponse.result);
                if (typeof countResponse?.count === 'number') setUnreadCount(countResponse.count);
            } catch {
                // The operational feed must not interrupt the primary workspace.
            }
        };
        loadNotifications();
        const intervalId = window.setInterval(loadNotifications, 60_000);
        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, [canViewNotifications]);

    const markNotificationRead = async (notificationId: number) => {
        const response = await customFetchMutation(`notifications/inbox/${notificationId}/read`, 'PATCH');
        if (response?.status !== 'success') return;
        setNotifications((current) => current.map((notification) => notification.id === notificationId ? { ...notification, readAt: new Date().toISOString() } : notification));
        setUnreadCount((current) => Math.max(0, current - 1));
    };

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
                        </div>
                    </div>

                    <div className={styles.headerCenter}></div>

                    <div className={styles.headerActions}>
                        <div className={`${styles.accountSummary} d-none d-md-flex`}>
                            <div className={styles.accountPrimary} title={`${user?.username || ''}(${roleLabel})`}>
                                {user?.username || 'User'}({roleLabel})
                            </div>
                            {daysToExpiration !== undefined && daysToExpiration !== null ? (
                                <div className={styles.accountSecondary} title={licenseInfo?.detail || 'License'}>
                                    {daysToExpiration > 0
                                        ? `${daysToExpiration} days to expiration of license`
                                        : daysToExpiration === 0
                                            ? 'Expires today'
                                            : 'License expired'}
                                </div>
                            ) : null}
                        </div>
                        <div className={styles.headerIconGroup} role="toolbar" aria-label="Account actions">
                            <button
                                type="button"
                                className={styles.headerIconBtn}
                                onClick={() => handleNavigation(`/human-resource/profile?employeeid=${employeeid}&&isOpenSideBarShow=false`)}
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
                            {canViewNotifications && <div className={styles.notificationControl}>
                                <button
                                    type="button"
                                    className={styles.headerIconBtn}
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    title="Notifications"
                                    aria-label="Open notifications"
                                    aria-expanded={isNotificationsOpen}
                                >
                                    <RiNotification3Line size={17} />
                                    {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
                                </button>
                                {isNotificationsOpen && (
                                    <div className={styles.notificationPanel} role="dialog" aria-label="Notifications">
                                        <div className={styles.notificationPanelHeader}>
                                            <strong>Notifications</strong>
                                            <span>{unreadCount} unread</span>
                                        </div>
                                        <div className={styles.notificationList}>
                                            {notifications.length === 0 ? (
                                                <div className={styles.notificationEmpty}>No notifications yet.</div>
                                            ) : notifications.map((notification) => (
                                                <button
                                                    type="button"
                                                    key={notification.id}
                                                    className={`${styles.notificationItem} ${!notification.readAt ? styles.notificationUnread : ''}`}
                                                    onClick={() => markNotificationRead(notification.id)}
                                                >
                                                    <span className={`${styles.notificationPriority} ${styles[`notificationPriority_${notification.priority}`] || ''}`} />
                                                    <span>
                                                        <strong>{notification.title}</strong>
                                                        <small>{notification.message}</small>
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>}
                            <span className={styles.headerIconDivider} aria-hidden="true" />
                            <a
                                href="/authentication/logout"
                                className={`${styles.headerIconBtn} ${styles.headerIconLogout}`}
                                title="Logout"
                                aria-label="Log out"
                            >
                                <RiLogoutBoxRLine size={17} />
                            </a>
                            <button
                                type="button"
                                className={`${styles.headerIconBtn} ${styles.headerIconApps}`}
                                onClick={() => setIsAppsOpen(true)}
                                title="Apps"
                                aria-label="Open apps menu"
                                aria-haspopup="dialog"
                                aria-expanded={isAppsOpen}
                            >
                                <RiMenu3Line size={17} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.twoColumnLayout} style={!isOpenSideBarShow ? { width: '100%' } : {}}>
                {isMobileSidebarOpen && <div className={styles.mobileOverlay} onClick={() => setIsMobileSidebarOpen(false)} />}

                {isOpenSideBarShow && (
                    <aside className={`${styles.quickLinksSidebar} ${isMobileSidebarOpen ? styles.mobileSidebarVisible : ''}`}>
                        <nav className={styles.sidebarNav} aria-label="Section navigation">
                            {visibleLinks.map(item => renderNavItem(item))}
                        </nav>
                    </aside>
                )}
                <main className={styles.mainContent} style={!isOpenSideBarShow ? { margin: 0, padding: 0 } : {}}>
                    <div className={styles.contentWrapper} style={!isOpenSideBarShow ? { padding: 0, margin: '10px', maxWidth: '100%' } : {}}>
                        {isSuperAdmin || canAccessFacilityModule(modulePath || "", settings?.moduleConfiguration)
                            ? children : <div className="alert alert-warning" role="alert">This module is not activated for your facility. Contact your platform administrator.</div>}
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
                            {roleLinks.length === 0 ? (
                                <div className={styles.appsEmpty}>No applications available for this role.</div>
                            ) : (
                                <div className={styles.appsGrid}>
                                    {roleLinks.map((link, index) => {
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
                                                    key={`app-${index}`}
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
                                                key={`app-${index}`}
                                                href={link.href}
                                                className={styles.appsTile}
                                                onClick={() => setIsAppsOpen(false)}
                                            >
                                                {content}
                                            </a>
                                        );
                                    })}
                                </div>
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
