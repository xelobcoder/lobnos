import React, { useState } from "react";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Folder as FolderIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  Task as TaskIcon,
  Info as InfoIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";

const App = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandedMenus({}); // Collapse all menus when the sidebar is collapsed
    }
  };

  const toggleMenu = (index) => {
    setExpandedMenus((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const styles = {
    page: {
      display: "flex",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    sidebar: {
      width: isCollapsed ? "80px" : "250px",
      backgroundColor: "#0d6efd",
      color: "#fff",
      height: "100%",
      transition: "width 0.3s",
      display: "flex",
      flexDirection: "column",
      padding: "10px",
      overflowY: "auto",
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
    },
    menuItem: {
      display: "flex",
      alignItems: "center",
      padding: "8px 10px", // Reduced padding for a more professional look
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
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      margin: "2px 0",
    },
    content: {
      flex: 1,
      padding: "20px",
      backgroundColor: "#f8f9fa",
    },
  };

  const links = [
    {
      icon: <DashboardIcon />, label: "Dashboard", subLinks: ["Overview", "Analytics", "Performance"]
    },
    {
      icon: <PersonIcon />, label: "Profile", subLinks: ["View Profile", "Edit Profile", "Settings"]
    },
    {
      icon: <BarChartIcon />, label: "Reports", subLinks: ["Daily Reports", "Monthly Reports", "Annual Reports"]
    },
    {
      icon: <SettingsIcon />, label: "Settings", subLinks: ["Account Settings", "Privacy Settings", "Notifications"]
    },
    {
      icon: <FolderIcon />, label: "Projects", subLinks: ["Ongoing", "Completed", "Archived"]
    },
    {
      icon: <MailIcon />, label: "Messages", subLinks: ["Inbox", "Sent", "Drafts"]
    },
    {
      icon: <NotificationsIcon />, label: "Notifications", subLinks: ["System Alerts", "User Notifications", "Logs"]
    },
    {
      icon: <TaskIcon />, label: "Tasks", subLinks: ["Pending", "Completed", "All Tasks"]
    },
    {
      icon: <InfoIcon />, label: "About", subLinks: ["Company Info", "Contact Us", "FAQ"]
    },
    {
      icon: <ExitToAppIcon />, label: "Logout", subLinks: []
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
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
                onClick={() => toggleMenu(index)}
              >
                <div style={styles.menuLabel}>
                  <span style={styles.menuIcon}>{link.icon}</span>
                  {!isCollapsed && <span>{link.label}</span>}
                </div>
                {!isCollapsed && link.subLinks.length > 0 && <span>{expandedMenus[index] ? "-" : "+"}</span>}
              </div>

              {expandedMenus[index] && link.subLinks.length > 0 && (
                <div style={styles.subMenu}>
                  {link.subLinks.map((subLink, subIndex) => (
                    <div
                      key={subIndex}
                      style={styles.subMenuItem}
                      onClick={() => alert(`${subLink} clicked!`)}
                    >
                      {subLink}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.content}>
        <h1>Welcome to the Dashboard</h1>
        <p>This is the main content area of the page.</p>
      </div>
    </div>
  );
};

export default App;
