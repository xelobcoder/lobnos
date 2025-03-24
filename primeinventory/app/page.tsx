"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductyDashboard() {
    const [activeMenu, setActiveMenu] = useState("Dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [openSections, setOpenSections] = useState({}); // Track open/closed state of sections


    // Custom icons as SVG components
    const icons = {
        dashboard: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
        ),
        analytics: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20v-6M6 20V10M18 20V4"></path>
            </svg>
        ),
        sales: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="20" x2="12" y2="10"></line>
                <line x1="18" y1="20" x2="18" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="16"></line>
            </svg>
        )
    };

    const menuItems = [
        {
            section: "Main",
            items: [
                { icon: icons.dashboard, name: "Dashboard" },
                { icon: icons.analytics, name: "Analytics" },
                { icon: icons.sales, name: "Sales" },
            ],
        },
        {
            section: "Management",
            items: [
                { icon: icons.dashboard, name: "Products" },
                { icon: icons.analytics, name: "Customer" },
                { icon: icons.sales, name: "Warehouse" },
                { icon: icons.dashboard, name: "Reports" },
            ],
        },
        {
            section: "Notifications",
            items: [
                { icon: icons.analytics, name: "Notifications" },
                { icon: icons.sales, name: "Transaction" },
                { icon: icons.dashboard, name: "Message" },
            ],
        },
    ];

    // Responsive handling
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            // Automatically close sidebar on desktop
            if (window.innerWidth > 768) {
                setIsSidebarOpen(false);
            }
        };

        // Check on mount
        checkMobile();

        // Add event listener
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleSection = (sectionName) => {
        setOpenSections(prevState => ({
            ...prevState,
            [sectionName]: !prevState[sectionName]
        }));
    };

    return (
        <div className="dashboard-container">
            <style jsx>{`
                /* Global Styles (applied to the container) */
                .dashboard-container {
                    font-family: 'Roboto, sans-serif';
                    background: linear-gradient(to right bottom, #f0f8ff, #e6f7ff); /* Light Blue-ish gradient */
                    min-height: 100vh;
                }

                /* Hamburger button */
                .hamburger {
                    display: none;
                    position: fixed;
                    top: 15px;
                    left: 15px;
                    z-index: 1100;
                    background: #4a5970;
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                }

                .hamburger:hover {
                    transform: scale(1.1);
                }

                /* Sidebar styles */
                .sidebar {
                    width: 250px;
                    height: 100vh;
                    background: linear-gradient(to bottom right, #4a5970, #2c3e50);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    left: 0;
                    top: 0;
                    transition: all 0.3s ease;
                    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                    z-index: 1000;
                }

                /* Overlay for mobile */
                .sidebar-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .hamburger {
                        display: block;
                    }

                    .sidebar {
                        transform: ${isSidebarOpen ? "translateX(0)" : "translateX(-100%)"};
                        width: 250px;
                        max-width: 80%;
                    }

                    .sidebar-overlay {
                        display: ${isSidebarOpen ? "block" : "none"};
                    }
                }

                .sidebar-logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255,255,255,0.05);
                }

                .sidebar-menu {
                    flex-grow: 1;
                    padding: 20px 0;
                    overflow-y: auto;
                }

                .menu-section-title {
                    color: #8e9bad;
                    text-transform: uppercase;
                    font-size: 12px;
                    padding: 0 20px;
                    margin-bottom: 10px;
                    letter-spacing: 1px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                }

                .menu-item {
                    display: flex;
                    align-items: center;
                    padding: 10px 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-left: 3px solid transparent;
                }

                .menu-item:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-left-color: #ff6b6b;
                }

                .menu-item.active {
                    background-color: rgba(255, 255, 255, 0.2);
                    border-left-color: #ff6b6b;
                }

                .menu-item .icon {
                    margin-right: 15px;
                    color: #8e9bad;
                    display: flex;
                    align-items: center;
                    width: 20px;
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                }

                .menu-item:hover .icon {
                    opacity: 1;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    padding: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0,0,0,0.1);
                }

                .user-avatar {
                    border-radius: 50%;
                    margin-right: 15px;
                    border: 2px solid rgba(255,255,255,0.2);
                }

                .user-details {
                    flex-grow: 1;
                }

                .user-name {
                    font-weight: bold;
                    font-size: 0.95rem;
                }

                .user-role {
                    color: #8e9bad;
                    font-size: 0.8rem;
                }

                .dropdown-icon {
                    margin-left: auto;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                }

                .dropdown-icon:hover {
                    opacity: 1;
                }

                 .section-items {
                    overflow: hidden;
                    height: auto;
                    transition: height 0.3s ease;
                }
            `}</style>

            {/* Hamburger Button */}
            {isMobile && (
                <button
                    className="hamburger"
                    onClick={toggleSidebar}
                    aria-label="Toggle Menu"
                >
                    {isSidebarOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
                        </svg>
                    )}
                </button>
            )}

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && isMobile && (
                <div className="sidebar-overlay" onClick={toggleSidebar}></div>
            )}

            {/* Sidebar */}
            <div className={`sidebar ${isMobile && !isSidebarOpen ? 'hidden' : ''}`}>
                <div className="sidebar-logo">
                    <span className="text-xl font-bold">Prime Laboratory</span>
                </div>

                <div className="sidebar-menu">
                    {menuItems.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-5">
                            <div
                                className="menu-section-title"
                                onClick={() => toggleSection(section.section)}
                            >
                                {section.section}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ transition: 'transform 0.2s ease' }}
                                    transform={openSections[section.section] ? 'rotate(180)' : ''}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                            <div className="section-items" style={{ display: openSections[section.section] ? 'block' : 'none' }}>
                                {section.items.map((item, itemIndex) => (
                                    <div
                                        key={itemIndex}
                                        className={`menu-item ${activeMenu === item.name ? "active" : ""}`}
                                        onClick={() => {
                                            setActiveMenu(item.name);
                                            // Close sidebar on mobile after selection
                                            if (isMobile) {
                                                setIsSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <div className="icon">{item.icon}</div>
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="user-profile">
                    <Image
                        src="/path-to-avatar/user-avatar.jpg"
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="user-avatar"
                    />
                    <div className="user-details">
                        <div className="user-name">AR Zakir</div>
                        <div className="user-role">Sales Manager</div>
                    </div>
                    <div className="dropdown-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
