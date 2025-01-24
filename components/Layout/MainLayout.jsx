import { useState } from "react";
import NavbarComponent from './NavBarComponent'
import SidebarComponent from './SideBarComponent'
import { useApplicationSettings } from "../Auth/useApplicationContext";
import Authorization from "../accessories/authorization";
export default function MainLayout({ children, sideLinks }) {
	const { applicationsettings } = useApplicationSettings();
	const { user, company, daysToExpiration } = applicationsettings;
	const { role } = user;
	const [showSidebar, setShowSidebar] = useState(false);
	const [expandedLinks, setExpandedLinks] = useState({});

	const toggleSidebar = () => setShowSidebar(!showSidebar);

	const toggleSubLinks = (index) => {
		setExpandedLinks((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	const isProductExpired = () => {
		if (daysToExpiration <= 0) {
			return <div className="text-white br-5 p-2 fw-bold text-uppercase bg-danger">License expired</div>;
		} else if (daysToExpiration > 0 && daysToExpiration <= 30) {
			return <div className="text-white br-5 p-2 fw-bold text-uppercase bg-danger">{daysToExpiration} days to license expiration</div>;
		}
	};

	if (!["scientist", "manager", "admin"].includes(role)) {
		return <Authorization />;
	}

	const updatedSideLinks = [
		{
			link: "/",
			title: "Home",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
					<path fill="none" d="M0 0h24v24H0z"></path>
					<path d="M12.5812 2.68627C12.2335 2.43791 11.7664 2.43791 11.4187 2.68627L1.9187 9.47198L3.08118 11.0994L11.9999 4.7289L20.9187 11.0994L22.0812 9.47198L12.5812 2.68627ZM19.5812 12.6863L12.5812 7.68627C12.2335 7.43791 11.7664 7.43791 11.4187 7.68627L4.4187 12.6863C4.15591 12.874 3.99994 13.177 3.99994 13.5V20C3.99994 20.5523 4.44765 21 4.99994 21H18.9999C19.5522 21 19.9999 20.5523 19.9999 20V13.5C19.9999 13.177 19.844 12.874 19.5812 12.6863ZM5.99994 19V14.0146L11.9999 9.7289L17.9999 14.0146V19H5.99994Z"></path>
				</svg>
			)
		},
		...sideLinks
	];

	return (
		<>
			<NavbarComponent company={company} onToggleSidebar={toggleSidebar} isProductExpired={isProductExpired} />
			<SidebarComponent
				showSidebar={showSidebar}
				onHide={toggleSidebar}
				company={company}
				sideLinks={updatedSideLinks}
				expandedLinks={expandedLinks}
				toggleSubLinks={toggleSubLinks}
			/>
			<main>
				{children}
			</main>
		</>
	);
}
