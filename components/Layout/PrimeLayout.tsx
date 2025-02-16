'use client';
import React, { useState } from "react";
import { links } from "./PrimeLinks";
import Link from "next/link";
import { useApplicationSettings } from "../Auth/useApplicationContext";



interface SubLink {
    title: string;
    link: string;
}

interface LinkItem {
    title: string;
    link: string;
    icon: React.ReactNode;
    subLinks: SubLink[];
}

interface PrimeLayoutProps {
    children: React.ReactNode;
}

// Define types for the inline styles
interface Styles {
    page: React.CSSProperties;
    sidebar: React.CSSProperties;
    companyName: React.CSSProperties;
    toggleButton: React.CSSProperties;
    menu: React.CSSProperties;
    menuItem: React.CSSProperties;
    menuLabel: React.CSSProperties;
    menuIcon: React.CSSProperties;
    subMenu: React.CSSProperties;
    subMenuItem: React.CSSProperties;
    content: React.CSSProperties;
    footer: React.CSSProperties;
    link: React.CSSProperties;
}

const PrimeLayout: React.FC<PrimeLayoutProps> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<number, boolean>>({});
    const { company } = useApplicationSettings().applicationsettings;

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


    const abbraviatedName = (name: string) => {
        if (!name) return;
        return name.split(" ").map((a, i) => a.split("")[0]).join(".")
    }







    const styles: Styles = {
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
        companyName: {
            textAlign: "center",
            fontWeight: "bold",
            borderRadius: '5px',
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
                <div style={styles.companyName}>
                    {isCollapsed ? abbraviatedName(company) : company}
                </div>
                <button style={styles.toggleButton} onClick={toggleSidebar}>
                    {isCollapsed ? ">" : "<"}
                </button>
                <div style={styles.menu}>
                    {Array.isArray(links) && links.map((link, index) => (
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
