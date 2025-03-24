import { Navbar, Nav, Button } from "react-bootstrap";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import { handleLogout } from "../Auth/customFetch";

export default function NavbarComponent({ company, onToggleSidebar, isProductExpired }) {
     return (
          <Navbar bg="primary" variant="dark" expand="lg" className="px-3">
               <Button variant="outline-light" onClick={onToggleSidebar} className="me-2">
                    <MenuIcon />
               </Button>
               <Navbar.Brand href="/" className="fw-bold d-none d-md-block">{company}</Navbar.Brand>
               <div className="d-flex ms-auto align-items-center gap-3">
                    {isProductExpired()}
                    <NotificationsIcon className="text-white" />
                    <PersonIcon className="text-white" />
                    <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
               </div>
          </Navbar>
     );
}
