import { useState } from "react";
import SubLinksSideBar from "./LinksDisplay";
import ApplicationHeader from "./HeaderNav";
import { Container } from "react-bootstrap";

export default function AppCustomLayout({ children, sideLinks }) {
  const [target, setTarget] = useState(null);
  const handleDropElements = (value) => {
    value == target ? setTarget(0) : setTarget(value);
  }


  return (
    <div class="body inter-400 roboto-light">
      <ApplicationHeader />
      <div style={{ display: 'grid', gridTemplateColumns: '60px auto' }}>
        <div >
          <div className="sidebar-macro-wrapper" >
            <ul className="sidebar-macro-ui-class">
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
