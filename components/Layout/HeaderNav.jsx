import { Inventory, LocalDiningOutlined, Menu } from "@mui/icons-material";
import AuthContext, { useTheme } from "../Auth/useAuthentification";
import { useContext } from "react";
import { handleLogout } from "../Auth/customFetch";
export default function ApplicationHeader({ openSideBar, sidebarState }) {
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
          <span className="d-apps-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM6.02332 15.4163C7.49083 17.6069 9.69511 19 12.1597 19C14.6243 19 16.8286 17.6069 18.2961 15.4163C16.6885 13.9172 14.5312 13 12.1597 13C9.78821 13 7.63095 13.9172 6.02332 15.4163ZM12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z"></path>
            </svg>
            <ul className="ui bg-body-secondary">
              <li>
                <Inventory className=" text-secondary" fontSize="large" />
                <span className="text-dark fw-bold">Inventory</span>
              </li>{" "}
              <li>
                <LocalDiningOutlined className=" text-secondary" fontSize="large" />
                <span className="text-dark fw-bold">Inventory</span>
              </li>
            </ul>
          </span>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M3 4C3 3.44772 3.44772 3 4 3H10C10.5523 3 11 3.44772 11 4V10C11 10.5523 10.5523 11 10 11H4C3.44772 11 3 10.5523 3 10V4ZM3 14C3 13.4477 3.44772 13 4 13H10C10.5523 13 11 13.4477 11 14V20C11 20.5523 10.5523 21 10 21H4C3.44772 21 3 20.5523 3 20V14ZM13 4C13 3.44772 13.4477 3 14 3H20C20.5523 3 21 3.44772 21 4V10C21 10.5523 20.5523 11 20 11H14C13.4477 11 13 10.5523 13 10V4ZM13 14C13 13.4477 13.4477 13 14 13H20C20.5523 13 21 13.4477 21 14V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V14Z"></path>
            </svg>
          </span>
          <span>
            <button className="btn btn-secondary btn-sm">
              <svg
                onClick={(ev) => {
                  handleLogout(employeeid);
                }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="fw-bold"
                fill="red">
                <path d="M6.26489 3.80698L7.41191 5.44558C5.34875 6.89247 4 9.28873 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 9.28873 18.6512 6.89247 16.5881 5.44558L17.7351 3.80698C20.3141 5.61559 22 8.61091 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 8.61091 3.68594 5.61559 6.26489 3.80698ZM11 12V2H13V12H11Z"></path>
              </svg>
            </button>
          </span>
        </div>
      </div>
    </header>
  );
}
