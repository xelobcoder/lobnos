import { useState } from "react";
import SubLinksSideBar from "./LinksDisplay";
import ApplicationHeader from "./HeaderNav";

export default function AppCustomLayout({ children, sideLinks }) {
  const [expand, setExpand] = useState(false);
  const [show, setShow] = useState(true);

  return (
    <div className="m-0 p-0">
      <ApplicationHeader openSideBar={setShow} sidebarState={show}/>
      <div className={`prime-lab-layout ${!expand && "prime-lab-layout-less"}`}>
        {show && (
          <aside>
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
          </aside>
        )}
        <main className={`mx-1 my-2 prime-main p-4`}>{children}</main>
      </div>
    </div>
  );
}
