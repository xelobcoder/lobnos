import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import GridViewIcon from '@mui/icons-material/GridView';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import { AddShoppingCart, Category, ExpandCircleDownSharp, UnarchiveRounded } from '@mui/icons-material';
import Link from 'next/link';

export default function InventoryHeaders({ auth ={} }) {
  const { username, role, email } = auth;

  return (
    <Navbar bg="light" expand="lg">
      <Link href="/">
        <Navbar.Brand>PLS</Navbar.Brand>
      </Link>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link>
            <GridViewIcon fontSize="small" sx={{ marginRight: '10px' }} />
            <Link href="/inventory">Stocks</Link>
          </Nav.Link>
          <Nav.Link>
            <Category fontSize="small" sx={{ marginRight: '10px' }} />
            <Link href="/inventory/stockcategory">Add category</Link>
          </Nav.Link>
          <Nav.Link>
            <AddShoppingCart fontSize="small" sx={{ marginRight: '10px' }} />
            <Link href="/inventory/addstock">New stock</Link>
          </Nav.Link>
          <Nav.Link>
            <ExpandCircleDownSharp fontSize="small" sx={{ marginRight: '10px' }} />
            <Link href="/inventory/expirestocks">Expires stocks</Link>
          </Nav.Link>
          <Nav.Link>
            <UnarchiveRounded fontSize="small" sx={{ marginRight: '10px' }} />
            <Link href="/inventory/stocks">Instocks</Link>
          </Nav.Link>
          <Nav.Link>
            <DepartureBoardIcon fontSize="small" sx={{ marginRight: '10px' }} />
            <Link href="/inventory/department">Department requisitions</Link>
          </Nav.Link>
          <Nav.Link>
            <DepartureBoardIcon fontSize="small" sx={{ marginRight: '10px' }} />
            <Link href="/inventory/stocksrequest">General Store</Link>
          </Nav.Link>
          <Nav.Link>
            <Link href="/inventory/warehouse">Warehouse</Link>
          </Nav.Link>
        </Nav>
        <Nav className="ml-auto">
          <span>{username} ({role})</span>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
