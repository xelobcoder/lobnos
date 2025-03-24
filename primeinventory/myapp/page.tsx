"use client";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';

function OffcanvasExample() {
	return (
		<>
			<Navbar expand="xxl" className="bg-primary-subtle text-sm mb-3">
				<Container fluid>
					<Navbar.Brand href="#">Navbar Offcanvas</Navbar.Brand>
					<Navbar.Toggle aria-controls="offcanvasNavbar" />
					<Navbar.Offcanvas
						id="offcanvasNavbar"
						aria-labelledby="offcanvasNavbarLabel"
						placement="end"
					>
						<Offcanvas.Header closeButton>
							<Offcanvas.Title id="offcanvasNavbarLabel">
								Offcanvas
							</Offcanvas.Title>
						</Offcanvas.Header>
						<Offcanvas.Body>
							<Nav className="justify-content-end flex-grow-1 pe-3">
								<Nav.Link href="#action1">Home</Nav.Link>
								<Nav.Link href="#action2">Link</Nav.Link>
								<NavDropdown title="Dropdown" id="offcanvasNavbarDropdown">
									<NavDropdown.Item href="#action3">Action</NavDropdown.Item>
									<NavDropdown.Item href="#action4">
										Another action
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item href="#action5">
										Something else here
									</NavDropdown.Item>
								</NavDropdown>
							</Nav>
							<Form className="d-flex">
								<Form.Control
									type="search"
									placeholder="Search"
									className="me-2"
									aria-label="Search"
								/>
								<Button variant="outline-success">Search</Button>
							</Form>
						</Offcanvas.Body>
					</Navbar.Offcanvas>
				</Container>
			</Navbar>
		</>
	);
}

export default OffcanvasExample;
