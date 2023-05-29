import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, TextField, Typography } from '@mui/material';
import { Dropdown } from 'react-bootstrap';
import styles from '../../styles/payment.module.css';
import { Email, Print, WhatsApp } from '@mui/icons-material';

export default function Navbar({ query, handleChange,select,runquery }) {


  return (
    <div className={styles.navbar}>
      <TextField
        type="text"
        variant="outlined"
        label="Enter clientID here"
        size="small"
        value={query.patientid}
        onChange={(e) => { handleChange(e, 'patientid') }}
        className={styles.navbarItem}
      />
      <Dropdown className={styles.navbarItem} onSelect={select}>
        <Dropdown.Toggle
          className={styles.dropdownToggle}
          style={{ height: "40px" }}
         
          id="dropdown-basic"
        >
          Select transaction month
        </Dropdown.Toggle>

        <Dropdown.Menu >
          <Dropdown.Item eventKey="january"
          >January</Dropdown.Item>
          <Dropdown.Item eventKey="february">February</Dropdown.Item>
          <Dropdown.Item eventKey="march">March</Dropdown.Item>
          <Dropdown.Item eventKey="april">April</Dropdown.Item>
          <Dropdown.Item eventKey="may">May</Dropdown.Item>
          <Dropdown.Item eventKey="june">June</Dropdown.Item>
          <Dropdown.Item eventKey="july">July</Dropdown.Item>
          <Dropdown.Item eventKey="august">August</Dropdown.Item>
          <Dropdown.Item eventKey="september">September</Dropdown.Item>
          <Dropdown.Item eventKey="october">October</Dropdown.Item>
          <Dropdown.Item eventKey="november">November</Dropdown.Item>
          <Dropdown.Item eventKey="december">December</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <input
        className={`${styles.navbarItem} form-control`}
        style={{ width: "200px" }}
        type="date"
        placeholder="date"
        value={query.date}
        onChange={(e) => { handleChange(e, 'date') }}
      />
      <Button type="button" variant="contained" size="small" 
      onClick={runquery} >
        search
      </Button>
      <div className="d-flex" style={{ marginLeft: "50px" }}>
        <input
          className="form-control"
          type="number"
          placeholder="Enter Billing ID here"
        />
        <Button
          startIcon={<Print />}
          variant="contained"
          sx={{
            marginLeft: "10px",
            color: 'white',
            width: "150px", backgroundColor: "black"
          }}
        >
          print
        </Button>
        <Button
          startIcon={<Email />}
          variant="contained"
          sx={{
            color: "white",
            width: "150px",
            marginRight: "10px",
            marginLeft: "10px",
            backgroundColor: "#2196f3",
          }}
        >
          Email
        </Button>
        <Button
          startIcon={<WhatsApp />}
          variant="contained"
          sx={{
            color: "white",
            width: "200px",
            marginLeft: "10px",
            backgroundColor: "#4caf50",
          }}
        >
          whatapp
        </Button>
      </div>
    </div>
  );
}
