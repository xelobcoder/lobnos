'use client';
import React, { useState } from "react";
import Link from "next/link";
import { links } from "../components/Layout/PrimeLinks";

const PrimeLayout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<number, boolean>>({});

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        if (!isCollapsed) {
            setExpandedMenus({});
        }
    };

    const toggleMenu = (index: number) => {
        setExpandedMenus((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    const styles = {
        page: {
            display: "flex",
            flexDirection: "row",
            height: "100vh",
            fontFamily: "Arial, sans-serif",
        },
        sidebar: {
            width: isCollapsed ? "80px" : "250px",
            backgroundColor: "rgb(17, 51, 85)",
            color: "#fff",
            height: "100vh",
            transition: "width 0.3s",
            display: "flex",
            flexDirection: "column",
            padding: "10px",
            position: "fixed",
            paddingBottom: "20px",
            overflowY: "auto",
            maxHeight: "100vh",
        },
        sidebarHeader: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: "20px",
            padding: "10px",
        },
        sidebarAvatar: {
            width: "40px",
            height: "40px",
            backgroundColor: "#0d6efd",
            borderRadius: "50%",
            color: "#fff",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "10px",
        },
        sidebarUserInfo: {
            display: "flex",
            flexDirection: "column",
        },
        sidebarUsername: {
            fontSize: "14px",
            fontWeight: "bold",
        },
        sidebarUserid: {
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.7)",
        },
        companyName: {
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "10px",
            fontSize: isCollapsed ? "20px" : "auto",
        },
        toggleButton: {
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "18px",
            cursor: "pointer",
            marginBottom: "20px",
            alignSelf: isCollapsed ? "center" : "flex-end",
        },
        menu: {
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
        },
        menuItem: {
            display: "flex",
            alignItems: "center",
            padding: "6px 8px",
            borderRadius: "6px",
            cursor: "pointer",
            justifyContent: "space-between",
        },
        menuLabel: {
            display: "flex",
            alignItems: "center",
        },
        menuIcon: {
            fontSize: "24px",
            marginRight: isCollapsed ? "0" : "10px",
        },
        subMenu: {
            display: "flex",
            flexDirection: "column",
            marginLeft: isCollapsed ? "0" : "20px",
            marginTop: "5px",
        },
        subMenuItem: {
            padding: "5px 10px",
            borderRadius: "5px",
            cursor: "pointer",
            color: 'white',
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            margin: "2px 0",
            fontSize: '15px !important'
        },
        content: {
            marginLeft: isCollapsed ? "80px" : "250px",
            flex: 1,
            padding: "20px",
            backgroundColor: "#f8f9fa",
            overflowY: "auto",
        },
        footer: {
            textAlign: "center",
            padding: "10px",
            backgroundColor: "#0d6efd",
            color: "#fff",
            marginTop: "auto",
        },
        link: {
            color: 'white'
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.sidebar}>
                {/* Sidebar Header */}
                <div style={styles.sidebarHeader}>
                    <div style={styles.sidebarAvatar}>JB</div>
                    <div style={styles.sidebarUserInfo}>
                        <p style={styles.sidebarUsername}>Hello johnson Boonson</p>
                        <p style={styles.sidebarUserid}>#9569 - leonides</p>
                    </div>
                </div>

                <div style={styles.companyName}>
                    {isCollapsed ? "C.N." : "Company Name"}
                </div>
                <button style={styles.toggleButton} onClick={toggleSidebar}>
                    {isCollapsed ? ">" : "<"}
                </button>
                <div style={styles.menu}>
                    {links.map((link, index) => (
                        <div key={index}>
                            <div
                                style={{
                                    ...styles.menuItem,
                                    ...(expandedMenus[index] ? { backgroundColor: "rgba(255, 255, 255, 0.2)" } : {}),
                                }}
                                onClick={() => {
                                    if (link.subLinks.length === 0) {
                                        window.location.href = link.link;
                                    } else {
                                        toggleMenu(index);
                                    }
                                }}
                            >
                                <div style={styles.menuLabel}>
                                    <span style={styles.menuIcon}>{link.icon}</span>
                                    {!isCollapsed && <span style={{ fontSize: '14px' }}>{link.title}</span>}
                                </div>
                                {!isCollapsed && link.subLinks.length > 0 && <span>{expandedMenus[index] ? "-" : "+"}</span>}
                            </div>

                            {expandedMenus[index] && link.subLinks.length > 0 && (
                                <div style={styles.subMenu}>
                                    {link.subLinks.map((subLink, subIndex) => (
                                        <Link style={styles.subMenuItem} className="text-sm" href={subLink.link} key={subIndex}>
                                            {subLink.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <footer style={styles.footer}>
                    {isCollapsed ? `Pls ${new Date().getFullYear()}` : "Prime Laboratory System © 2025"}
                </footer>
            </div>

            <div style={styles.content}>
                {children}
            </div>
        </div>
    );
};

export default PrimeLayout;
