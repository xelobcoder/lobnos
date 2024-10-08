import { Menu } from "@mui/icons-material";
import AuthContext, { useTheme } from "../Auth/useAuthentification";
import { useContext } from "react";
import { handleLogout } from "../Auth/customFetch";
import { Container } from "react-bootstrap";
export default function ApplicationHeader() {
	const { auth } = useContext(AuthContext);
	const { username, role, branch, employeeid } = auth;
	const { company, daysToExpiration } = useTheme();

	const isProductExpired = () => {
		if (daysToExpiration === 0 || daysToExpiration < 0) {
			return <div className="text-white br-5 p-2 fw-bold text-uppercase bg-danger">license expired</div>
		} else if (daysToExpiration > 0 && daysToExpiration <= 30) {
			return <div className="text-white br-5 p-2 fw-bold text-uppercase bg-danger">{daysToExpiration} days to license expiration</div>
		} else {
			return
		}
	}

	return (
		<header className="bg-lims-default text-white prime-header ui">
			<Container fluid>
				<div className="d-flex justify-content-between">
					<div className="d-flex align-items-center">
						<div className="pls-header text-sm-start ">{company}</div>
						{isProductExpired()}
					</div>
					<div className="d-md-flex d-sm-flex  d-lg-none d-xl-none ">
						<div className="px-2 pointer py-1 border my-2 mx-2 br-5">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"></path></svg>
						</div>
					</div>
					<div id="prime-header-branch" className="pointer d-none d-lg-flex" >
						<span >{branch}</span>
						<span >
							{username}({role})
						</span>
						<span>
							<button className="btn btn-danger btn-sm br-0 d-sm-none d-lg-flex d-md-none d-xl-flex">
								<span>
									<svg
										onClick={(ev) => {
											handleLogout(employeeid);
										}}
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										width="24"
										height="24"
										className="fw-bold"
										fill="white">
										<path d="M6.26489 3.80698L7.41191 5.44558C5.34875 6.89247 4 9.28873 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 9.28873 18.6512 6.89247 16.5881 5.44558L17.7351 3.80698C20.3141 5.61559 22 8.61091 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 8.61091 3.68594 5.61559 6.26489 3.80698ZM11 12V2H13V12H11Z"></path>
									</svg>
								</span>
								<span>
									LOGOUT
								</span>
							</button>
						</span>
					</div>
				</div>
			</Container>
		</header>
	);
}
