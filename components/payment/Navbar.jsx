import React from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { Dropdown } from 'react-bootstrap';
import styles from '../../styles/payment.module.css'; 

export default function Navbar() {
  return (
    <div className={styles.navbar}>
      <Typography variant="h6" className={styles.navbarItem}>
        Account
      </Typography>
      <TextField
        type="text"
        variant="outlined"
        label="Enter clientID here"
        size="small"
        className={styles.navbarItem}
      />
      <Typography variant="h6" className={styles.navbarItem}>
        Statement period
      </Typography>
      <Dropdown className={styles.navbarItem}>
        <Dropdown.Toggle className={styles.dropdownToggle} id="dropdown-basic">
          Select transaction month
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="#/january">January</Dropdown.Item>
          <Dropdown.Item href="#/february">February</Dropdown.Item>
          <Dropdown.Item href="#/march">March</Dropdown.Item>
          <Dropdown.Item href="#/april">April</Dropdown.Item>
          <Dropdown.Item href="#/may">May</Dropdown.Item>
          <Dropdown.Item href="#/june">June</Dropdown.Item>
          <Dropdown.Item href="#/july">July</Dropdown.Item>
          <Dropdown.Item href="#/august">August</Dropdown.Item>
          <Dropdown.Item href="#/september">September</Dropdown.Item>
          <Dropdown.Item href="#/october">October</Dropdown.Item>
          <Dropdown.Item href="#/november">November</Dropdown.Item>
          <Dropdown.Item href="#/december">December</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <TextField type="date" label="Date" variant="outlined" size="small" className={styles.navbarItem} />
      <Button variant="outlined" color="inherit" className={styles.printButton}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-printer" viewBox="0 0 16 16">
          <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
          <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
        </svg>
      </Button>
    </div>
  );
}
