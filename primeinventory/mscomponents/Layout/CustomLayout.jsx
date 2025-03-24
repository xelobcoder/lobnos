import { useState } from "react";
import SubLinksSideBar from "./LinksDisplay";
import ApplicationHeader from "./HeaderNav";
import { Container } from "react-bootstrap";
import Link from "next/link";
import { Home } from "@mui/icons-material";
import  { useApplicationSettings } from "../Auth/useApplicationContext";
export default function AppCustomLayout({ children, sideLinks }) {
	const [target, setTarget] = useState(null);
	const { applicationsettings } = useApplicationSettings();
	const { username, role } = applicationsettings.user;

	const handleDropElements = (value) => {
		value == target ? setTarget(0) : setTarget(value);
	}


	return (
		<div class="body inter-400 roboto-light">
			<ApplicationHeader />
			<div className="app-partitioner">
				<div >
					<div className="sidebar-macro-wrapper" >
						<ul className="sidebar-macro-ui-class">
							<li className="grouper">
								<Link href={'/'}
									className={`link-group text-capitalize br-5 a-active  m-2 `}>
									<span className="rxn-icon"><Home /></span>
									<span className="text-sidebar">Home</span>
								</Link>
							</li>
							<SubLinksSideBar sideLinks={sideLinks} target={target} handleDropElements={handleDropElements} />
						</ul>
						<li className="grouper" style={{ position: 'absolute', top: '80%', left: "35%" }}>
							<span className="d-flex justify-content-center">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3.78307 2.82598L12 1L20.2169 2.82598C20.6745 2.92766 21 3.33347 21 3.80217V13.7889C21 15.795 19.9974 17.6684 18.3282 18.7812L12 23L5.6718 18.7812C4.00261 17.6684 3 15.795 3 13.7889V3.80217C3 3.33347 3.32553 2.92766 3.78307 2.82598ZM5 4.60434V13.7889C5 15.1263 5.6684 16.3752 6.7812 17.1171L12 20.5963L17.2188 17.1171C18.3316 16.3752 19 15.1263 19 13.7889V4.60434L12 3.04879L5 4.60434ZM12 11C10.6193 11 9.5 9.88071 9.5 8.5C9.5 7.11929 10.6193 6 12 6C13.3807 6 14.5 7.11929 14.5 8.5C14.5 9.88071 13.3807 11 12 11ZM7.52746 16C7.77619 13.75 9.68372 12 12 12C14.3163 12 16.2238 13.75 16.4725 16H7.52746Z"></path></svg>
							</span>
							<span className="d-flex d-md-none d-xl-none d-lg-none">
								{username}({role})
							</span>
						</li>
					</div>
				</div>
				<div>
					<Container fluid className="p-2" >
						{children}
					</Container>
				</div>
			</div>
		</div>
	);
}
