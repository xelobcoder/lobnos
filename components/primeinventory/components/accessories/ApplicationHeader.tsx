"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "../../styles/header.module.css";
import ApplicationSideBar from "../../Lib/ApplicationSideBar";
import { Offcanvas, Dropdown, InputGroup, FormControl, Button } from "react-bootstrap";
import OffCanvasApplicationSideBar from "./OffCanvasSideBar";
import { SidebarLinkType } from "../interfaces/departmentInterface";
import { useApplication } from "../application/ApplicationContextProvider";

export type ExpandedTargetType = number | undefined | string | null;

interface ApplicationHeaderProps {
	children: React.ReactNode;
	sidebarLinks: SidebarLinkType[];
}

const ApplicationHeader: React.FC<ApplicationHeaderProps> = ({ children, sidebarLinks }) => {
	const searchParams = useSearchParams();
	const expandedTargetQuery = searchParams.get("expandedTarget") as ExpandedTargetType;
	const [expandedTarget, setExpandedTarget] = useState<ExpandedTargetType>(expandedTargetQuery);
	const [showSidebar, setShowSidebar] = useState(false);
	const [sideUnfold, setSideBarUnfold] = useState<boolean>(false);

	const { user } = useApplication();

	const handleTarget = (value: number) => setExpandedTarget(value);
	const toggleSidebar = () => {
		setShowSidebar(!showSidebar);
	};

	const handleUnfold = () => {
		setSideBarUnfold(!sideUnfold);
		setExpandedTarget(undefined);
	};

	return (
		<Suspense fallback={<h1>Please Wait. Loading Application</h1>}>
			<div className={styles.applicationLayout}>
				<nav className="p-2 text-white pointer d-flex justify-content-between align-items-center ">
					<div className="d-lg-none ">
						{showSidebar ? (
							<svg
								onClick={toggleSidebar}
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								width="32"
								height="32"
								className="close-svg"
							>
								<path fill="none" d="M0 0h24v24H0z" />
								<path d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z" />
							</svg>
						) : (
							<svg
								onClick={toggleSidebar}
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								width="32"
								height="32"
								className="menu-svg"
							>
								<path fill="none" d="M0 0h24v24H0z" />
								<path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
							</svg>
						)}
					</div>

					<div className="softwarelabelheader text-uppercase mx-2  sm">Prime Inventory System</div>


					<div className="d-none d-md-block col-4">
						<InputGroup>
							<FormControl
								placeholder="Search..."
								aria-label="Search"
								aria-describedby="search-addon"
								style={{ height: '40px' }}
							/>
							<Button variant="outline-light" id="search-addon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
									<path fill="none" d="M0 0h24v24H0z" />
									<path d="M23 21L17 15M18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10V18H18V10ZM20 18.6667L20.4 19.2C20.5657 19.4209 20.5209 19.7343 20.3 19.9C20.2135 19.9649 20.1082 20 20 20H4C3.72386 20 3.5 19.7761 3.5 19.5C3.5 19.3918 3.53509 19.2865 3.6 19.2L4 18.6667V10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10V18.6667ZM9.5 21H14.5C14.5 22.3807 13.3807 23.5 12 23.5C10.6193 23.5 9.5 22.3807 9.5 21Z" />
								</svg>
							</Button>
						</InputGroup>
					</div>


					<div className="d-flex align-items-center ">

						<Dropdown className="">
							<Dropdown.Toggle variant="link" className="text-white">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
									<path fill="none" d="M0 0h24v24H0z" />
									<path d="M18 10C18 6.68629 15.3137 4 12 4C8.68629 4 6 6.68629 6 10V18H18V10ZM20 18.6667L20.4 19.2C20.5657 19.4209 20.5209 19.7343 20.3 19.9C20.2135 19.9649 20.1082 20 20 20H4C3.72386 20 3.5 19.7761 3.5 19.5C3.5 19.3918 3.53509 19.2865 3.6 19.2L4 18.6667V10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10V18.6667ZM9.5 21H14.5C14.5 22.3807 13.3807 23.5 12 23.5C10.6193 23.5 9.5 22.3807 9.5 21Z" />
								</svg>
							</Dropdown.Toggle>
							<Dropdown.Menu>
								<Dropdown.Item href="#">Alert 1</Dropdown.Item>
								<Dropdown.Item href="#">Alert 2</Dropdown.Item>
								<Dropdown.Item href="#">Alert 3</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
						<div>
							<span>{user}</span>
						</div>
						<Dropdown>
							<Dropdown.Toggle variant="link" className="text-white">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
									<path fill="none" d="M0 0h24v24H0z" />
									<path d="M12 2C8.68629 2 6 4.68629 6 8C6 9.1424 6.73579 10.1927 7.85255 10.9015C7.32035 11.7469 7 12.8865 7 14C7 17.3137 9.68629 20 12 20C14.3137 20 17 17.3137 17 14C17 12.8865 16.6797 11.7469 16.1474 10.9015C17.2642 10.1927 18 9.1424 18 8C18 4.68629 15.3137 2 12 2ZM12 18C10.3431 18 9 16.6569 9 15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15C15 16.6569 13.6569 18 12 18Z" />
								</svg>
							</Dropdown.Toggle>
							<Dropdown.Menu>
								<Dropdown.Item href="#">Profile</Dropdown.Item>
								<Dropdown.Item href="#">Settings</Dropdown.Item>
								<Dropdown.Item href="#">Logout</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</div>
				</nav>

				<div className={styles.slitter}>
					<div className={sideUnfold ? styles.sidebarWrapperfold : styles.sidebarWrapper} >
						<ApplicationSideBar
							sidebarLinks={sidebarLinks}
							handleTarget={handleTarget}
							expandedTarget={expandedTarget}
							handleUnfold={handleUnfold}
							isExpanded={sideUnfold}
						/>
					</div>

					<div className="d-lg-none p-0  d-md-none">
						<Offcanvas responsive="lg" show={showSidebar} onHide={toggleSidebar} placement="start" className="p-0" style={{ width: '100%' }}>
							<Offcanvas.Header closeButton>
								<Offcanvas.Title>Menu</Offcanvas.Title>
							</Offcanvas.Header>
							<Offcanvas.Body className="p-0">
								<OffCanvasApplicationSideBar
									handleUnfold={handleUnfold}
									isExpanded={sideUnfold}
									sidebarLinks={sidebarLinks}
									handleTarget={handleTarget}
									expandedTarget={expandedTarget}
								/>
							</Offcanvas.Body>
						</Offcanvas>
					</div>

					<div className={styles.mainBarWrapper}>
						<main>
							{children}</main>
					</div>
				</div >
			</div>
		</Suspense>
	);
};

export default ApplicationHeader;
