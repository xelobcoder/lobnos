import { useContext, useState } from "react"
import { Logout, Menu } from "@mui/icons-material";
import AuthContext from "../Auth/useAuthentification";
import SubLinksSideBar from "./LinksDisplay";
import { handleLogout } from "../Auth/customFetch";

export default function AppCustomLayout({ children, sideLinks }) {
  const { auth } = useContext(AuthContext);
  const { username, role, branch, employeeid } = auth;
  const [expand, setExpand] = useState(true);
  const [show, setShow] = useState(true);

  return (
    <div className="m-0 p-0">
      <header className="bg-lims-default text-white  prime-header">
        <div className="d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <Menu
              id="menubar"
              tabIndex="0"
              onClick={(ev) => {
                setShow(!show);
              }}
              className="border pointer mx-3 my-2 br-5 bg-secondary text-white"
              fontSize="large"
            />
            <div className="pls-header mx-3">Prime Laboratory System</div>
          </div>
          <div id="prime-header-branch">
            <span>{branch}</span>
            <span>
              {username}({role})
            </span>
            <span>
              <button
                onClick={(ev) => {
                  handleLogout(employeeid);
                }}
                className="btn btn-secondary btn-sm">
                <Logout />
              </button>
            </span>
          </div>
        </div>
      </header>
      <div className={`prime-lab-layout ${!expand && "prime-lab-layout-less"}`}>
        {show && <aside>
          <div
            onMouseOver={(ev) => {
              setExpand(true);
            }}
            onMouseOut={(ev) => {
              if (window && window.innerWidth > 1200) {
                setExpand(false);
              }
            }}
            className={`sidebarr ${!expand && "sidebarr-expand-less"}`}>
            <div className="content">
              <ul className="sidebarul">
                <SubLinksSideBar expand={expand} sideLinks={sideLinks} />
              </ul>
            </div>
            <div className=""></div>
          </div>
        </aside>}
        <main className={`mx-1 my-2 prime-main`}>{children}</main>
      </div>
    </div>
  );
}
