import {Menu } from "@mui/icons-material";
import AuthContext, { useTheme } from "../Auth/useAuthentification";
import { useContext } from "react";
import { handleLogout } from "../Auth/customFetch";
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
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <Menu
            id="menubar"
            tabIndex="0"
            onClick={(ev) => {
              if (openSideBar && sidebarState) {
                openSideBar(!sidebarState);
              }
            }}
            className="border pointer mx-3 my-2 br-5 bg-secondary text-white"
            fontSize="large"
          />
          <div className="pls-header mx-3">{company}</div>
          {isProductExpired()}
        </div>
        <div id="prime-header-branch" className="pointer">
          <span>{branch}</span>
          <span>
            {username}({role})
          </span>

          <span className="pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C16.9706 2 21 6.04348 21 11.0314V20H3V11.0314C3 6.04348 7.02944 2 12 2ZM9.5 21H14.5C14.5 22.3807 13.3807 23.5 12 23.5C10.6193 23.5 9.5 22.3807 9.5 21Z"></path>
            </svg>
          </span>
          <span>
            <button className="btn btn-danger btn-sm">
              LOGOUT
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
            </button>
          </span>
        </div>
      </div>
    </header>
  );
}
