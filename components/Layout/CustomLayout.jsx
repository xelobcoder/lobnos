import { useState } from "react";
import SubLinksSideBar from "./LinksDisplay";
import ApplicationHeader from "./HeaderNav";
import { Container } from "react-bootstrap";
import Link from "next/link";
import { Home } from "@mui/icons-material";
export default function AppCustomLayout({ children, sideLinks }) {
	const [target, setTarget] = useState(null);
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
