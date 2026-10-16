'use client';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from './PrimeLayout.module.css';
import workspaceStyles from './WorkspaceLayout.module.css';
import ribbonStyles from './RibbonLayout.module.css';
import RibbonNavigation from './RibbonNavigation';
import NextLink from 'next/link';
import { findActiveNavigationPath } from '../../lib/ribbonNavigation';
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
    RiLayout2Line,
    RiArrowDownSLine,
    RiArrowRightSLine,
} from '@remixicon/react';
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { Link as LinkType } from "./links/types";
import { AccountantRoleLinks, AdminRoleLinks, FrontdeskRoleLinks, LaboratoryScientistRoleLinks, PhelobotomyRoleLinks, SonographerRoleLinks, SuperAdminRoleLinks } from "../FrontPageView/RoleLinks";
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
    const activeLayout = settings?.workspaceLayout === 'claude'
        ? 'claude'
        : settings?.workspaceLayout === 'zoho'
            ? 'zoho'
            : settings?.workspaceLayout === 'ribbon'
                ? 'ribbon'
                : 'classic';
    const isWorkspaceLayout = activeLayout !== 'classic';
    const isClaudeLayout = activeLayout === 'claude';
    const isRibbonLayout = activeLayout === 'ribbon';
    const [openNavigationGroup, setOpenNavigationGroup] = useState<string | null>(null);
    const [isFontSelectorOpen, setIsFontSelectorOpen] = useState<boolean>(false);
    const [isAppsOpen, setIsAppsOpen] = useState<boolean>(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const normalizedRole = String(user?.role || '').toLowerCase().trim().replace(/_/g, '-');
    const isSuperAdmin = normalizedRole.replace(/[\s-]/g, '') === 'superadmin';
    const roleLinks = isSuperAdmin ? SuperAdminRoleLinks : (roleViews[user.role] || []).filter(item =>
        canAccessFacilityModule(item.href || "", settings?.moduleConfiguration, { smsActivated: settings?.smsActivated }));
    const visibleLinks = useMemo(() => {
        const filterLinks = (items: LinkType[]): LinkType[] => items
            .filter((item) => isSuperAdmin || !item.roles || item.roles.some((role) => role.replace(/_/g, '-').toLowerCase() === normalizedRole))
            .filter((item) => isSuperAdmin || canAccessFacilityModule(item.link || "", settings?.moduleConfiguration,
                { smsActivated: settings?.smsActivated }))
            .map((item) => ({
                ...item,
                children: item.children ? filterLinks(item.children) : item.children,
            }))
            .filter((item) => !item.children || item.children.length > 0 || item.link);

        return filterLinks(links || []);
    }, [links, normalizedRole, isSuperAdmin, settings?.moduleConfiguration, settings?.smsActivated]);
    const canViewNotifications = ['admin', 'manager', 'super-admin', 'super admin'].includes(String(user?.role || '').toLowerCase().trim());
    const activeNavigationPath = useMemo(() => findActiveNavigationPath(visibleLinks, modulePath || ''), [visibleLinks, modulePath]);
    const employeeid = user?.employeeid || 0;
    const [currentPath, setCurrentPath] = useState<string>("");
    const isOpenSideBarShow = useSearchParams().get("isOpenSideBarShow") !== "false";

    useEffect(() => {
        setCurrentPath(modulePath || '');
        setOpenNavigationGroup(null);
        setIsMobileSidebarOpen(false);
    }, [modulePath]);

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
            if (isRibbonLayout) router.push(path);
            else window.location.href = path;
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

    const containsCurrentPage = (item: LinkType): boolean =>
        item.link === modulePath || Boolean(item.children?.some(containsCurrentPage));

    const renderWorkspaceNavItem = (item: LinkType, key: string, depth = 0): React.ReactNode => {
        const hasChildren = Boolean(item.children?.length);
        const isActive = item.link === modulePath;
        const containsActive = containsCurrentPage(item);
        const isExpanded = openNavigationGroup === null ? containsActive : openNavigationGroup === key;
        const isCompact = isQuickLinksCollapsed && !isMobileSidebarOpen;
        const submenuId = `workspace-nav-${key}`;
        const icon = item.icon || <RiLayout2Line size={16} />;

        if (hasChildren) {
            return (
                <div key={key} className={workspaceStyles.group}>
                    <button
                        type="button"
                        className={`${workspaceStyles.item} ${workspaceStyles.groupButton} ${containsActive ? workspaceStyles.currentGroup : ''}`}
                        onClick={() => {
                            if (isQuickLinksCollapsed) setIsQuickLinksCollapsed(false);
                            setOpenNavigationGroup(isExpanded && !isCompact ? '' : key);
                        }}
                        title={item.title}
                        aria-label={item.title}
                        aria-expanded={isExpanded && !isCompact}
                        aria-controls={submenuId}
                    >
                        <span className={workspaceStyles.icon}>{icon}</span>
                        <span className={workspaceStyles.label}>{item.title}</span>
                        <span className={workspaceStyles.chevron} aria-hidden="true">
                            {isExpanded ? <RiArrowDownSLine size={16} /> : <RiArrowRightSLine size={16} />}
                        </span>
                    </button>
                    {isExpanded && !isCompact && (
                        <div id={submenuId} className={workspaceStyles.submenu} role="group" aria-label={item.title}>
                            {item.children?.map((child, index) => renderWorkspaceNavItem(child, `${key}-${index}`, depth + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <button
                key={key}
                type="button"
                className={`${workspaceStyles.item} ${depth > 0 ? workspaceStyles.child : ''} ${isActive ? workspaceStyles.active : ''}`}
                onClick={() => handleNavigation(item.link)}
                title={item.title}
                aria-label={item.title}
                aria-current={isActive ? 'page' : undefined}
            >
                <span className={workspaceStyles.icon}>{icon}</span>
                <span className={workspaceStyles.label}>{item.title}</span>
            </button>
        );
    };

    return (
        <div className={`${styles.container} ${isWorkspaceLayout ? `${workspaceStyles.shell} ${isClaudeLayout ? workspaceStyles.claudeLayout : ''} ${isRibbonLayout ? ribbonStyles.layout : ''}` : ''} ${isQuickLinksCollapsed ? `${styles.quickLinksCollapsed} ${workspaceStyles.collapsed}` : styles.quickLinksExpanded} ${isMobileSidebarOpen ? `${styles.mobileSidebarOpen} ${workspaceStyles.mobileOpen}` : ''} ${!isOpenSideBarShow ? `${workspaceStyles.sidebarHidden} ${ribbonStyles.sidebarHidden}` : ''}`}>
            {isRibbonLayout && <a href="#workspace-main" className={ribbonStyles.skipLink}>Skip to workspace</a>}
            <header className={`${styles.darkHeader} ${isWorkspaceLayout ? workspaceStyles.header : ''} ${isRibbonLayout ? ribbonStyles.header : ''}`}>
                <div className={`${styles.headerContent} ${isWorkspaceLayout ? workspaceStyles.headerContent : ''}`}>
                    <div className={`${styles.headerLeft} ${isWorkspaceLayout ? workspaceStyles.headerLeft : ''}`}>
                        {isWorkspaceLayout && !isClaudeLayout && (
                            <div className={workspaceStyles.headerBrand} aria-label="Prime Laboratory Software">
                                <span className={`${workspaceStyles.headerBrandMark} ${isRibbonLayout ? ribbonStyles.brandMark : ''}`} aria-hidden="true">PLS</span>
                                <span className={workspaceStyles.headerBrandName}>Prime Laboratory Software</span>
                            </div>
                        )}
                        {isOpenSideBarShow && !isClaudeLayout && !isRibbonLayout && (
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
                        {!isRibbonLayout && <button
                            type="button"
                            className={`${styles.mobileMenuButton} ${isWorkspaceLayout ? workspaceStyles.mobileMenuButton : ''}`}
                            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            <RiMenuLine size={20} />
                        </button>}

                        <div className={styles.brandBlock}>
                            <div className={styles.companyRow}>
                                <h1 className={`${styles.companyName} ${isWorkspaceLayout ? workspaceStyles.companyName : ''} ${isRibbonLayout ? ribbonStyles.companyName : ''}`} title={company || ''}>
                                    {company || 'Organization'}
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.headerCenter} ${isWorkspaceLayout ? workspaceStyles.headerCenter : ''}`}></div>

                    <div className={`${styles.headerActions} ${isWorkspaceLayout ? workspaceStyles.headerActions : ''}`}>
                        <div className={`${styles.accountSummary} d-none d-md-flex`}>
                            <div className={`${styles.accountPrimary} ${isWorkspaceLayout ? workspaceStyles.accountName : ''}`} title={`${user?.username || ''}(${roleLabel})`}>
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
                        <div className={`${styles.headerIconGroup} ${isWorkspaceLayout ? workspaceStyles.headerToolbar : ''}`} role="toolbar" aria-label="Account actions">
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
                                    {unreadCount > 0 && <span className="small">{unreadCount > 99 ? '99+' : unreadCount}</span>}
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

            {isRibbonLayout && isOpenSideBarShow && <RibbonNavigation links={visibleLinks} pathname={modulePath || ''}
                onNavigate={() => setIsMobileSidebarOpen(false)} />}

            <div className={`${styles.twoColumnLayout} ${isWorkspaceLayout ? workspaceStyles.body : ''}`} style={!isOpenSideBarShow ? { width: '100%' } : {}}>
                {!isRibbonLayout && isMobileSidebarOpen && <div className={styles.mobileOverlay} onClick={() => setIsMobileSidebarOpen(false)} />}

                {isOpenSideBarShow && !isRibbonLayout && (
                    <aside className={`${styles.quickLinksSidebar} ${isWorkspaceLayout ? workspaceStyles.sidebar : ''} ${isMobileSidebarOpen ? styles.mobileSidebarVisible : ''}`}>
                        {isWorkspaceLayout ? (
                            <>
                                {isClaudeLayout && (
                                    <div className={workspaceStyles.claudeSidebarHeader}>
                                        <div className={workspaceStyles.claudeBrandMark} aria-hidden="true">PLS</div>
                                        <div className={workspaceStyles.claudeBrandText}>
                                            <strong>Prime Laboratory Software</strong>
                                            <span>{company || 'Workspace'}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className={workspaceStyles.claudeCollapseButton}
                                            onClick={() => setIsQuickLinksCollapsed(!isQuickLinksCollapsed)}
                                            aria-label={isQuickLinksCollapsed ? "Expand navigation" : "Collapse navigation"}
                                            title={isQuickLinksCollapsed ? "Expand navigation" : "Collapse navigation"}
                                        >
                                            {isQuickLinksCollapsed ? <RiArrowRightLine size={17} /> : <RiArrowLeftLine size={17} />}
                                        </button>
                                    </div>
                                )}
                                {isClaudeLayout && (
                                    <button
                                        type="button"
                                        className={`${workspaceStyles.appsButton} ${workspaceStyles.claudeAppsButton}`}
                                        onClick={() => setIsAppsOpen(true)}
                                        aria-label="Open apps menu from navigation"
                                        aria-haspopup="dialog"
                                        aria-expanded={isAppsOpen}
                                    >
                                        <RiLayout2Line size={18} />
                                        <span className={workspaceStyles.label}>All applications</span>
                                    </button>
                                )}
                                <nav className={workspaceStyles.navigation} aria-label="Section navigation">
                                    {visibleLinks.map((item, index) => renderWorkspaceNavItem(item, String(index)))}
                                </nav>
                                {isClaudeLayout ? (
                                    <button
                                        type="button"
                                        className={workspaceStyles.claudeAccount}
                                        onClick={() => handleNavigation(`/human-resource/profile?employeeid=${employeeid}&&isOpenSideBarShow=false`)}
                                        aria-label="Open profile"
                                    >
                                        <span className={workspaceStyles.claudeAvatar} aria-hidden="true">
                                            {(user?.username || 'U').trim().charAt(0).toUpperCase()}
                                        </span>
                                        <span className={workspaceStyles.claudeAccountText}>
                                            <strong>{user?.username || 'User'}</strong>
                                            <small>{roleLabel}</small>
                                        </span>
                                        <RiArrowRightSLine size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className={workspaceStyles.appsButton}
                                        onClick={() => {
                                            setIsMobileSidebarOpen(false);
                                            setIsAppsOpen(true);
                                        }}
                                        aria-label="Open apps menu from navigation"
                                        aria-haspopup="dialog"
                                        aria-expanded={isAppsOpen}
                                        title="All apps"
                                    >
                                        <RiLayout2Line size={20} />
                                        <span className={workspaceStyles.label}>All applications</span>
                                    </button>
                                )}
                            </>
                        ) : (
                            <nav className={styles.sidebarNav} aria-label="Section navigation">
                                {visibleLinks.map(item => renderNavItem(item))}
                            </nav>
                        )}
                    </aside>
                )}
                <main className={`${styles.mainContent} ${isWorkspaceLayout ? workspaceStyles.main : ''} ${isRibbonLayout ? ribbonStyles.main : ''}`} id="workspace-main" tabIndex={isRibbonLayout ? -1 : undefined} style={!isOpenSideBarShow ? { margin: 0, padding: 0 } : {}}>
                    <div className={`${styles.contentWrapper} ${isWorkspaceLayout ? workspaceStyles.content : ''} ${isRibbonLayout ? ribbonStyles.content : ''}`} style={!isOpenSideBarShow ? { padding: 0, margin: '10px', maxWidth: '100%' } : {}}>
                        {isRibbonLayout && isOpenSideBarShow && activeNavigationPath.length > 0 && <nav aria-label="Breadcrumb">
                            <ol className={ribbonStyles.breadcrumb}>
                                {activeNavigationPath.map((item, index) => <li key={`${item.title}-${index}`}>
                                    {index < activeNavigationPath.length - 1 && item.link
                                        ? <NextLink href={item.link} prefetch={false}>{item.title}</NextLink>
                                        : <span aria-current={index === activeNavigationPath.length - 1 ? 'page' : undefined}>{item.title}</span>}
                                </li>)}
                            </ol>
                        </nav>}
                        {isSuperAdmin || canAccessFacilityModule(modulePath || "", settings?.moduleConfiguration,
                            { smsActivated: settings?.smsActivated })
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
