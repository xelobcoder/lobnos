import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Refresh } from "@mui/icons-material";



function Header() {
  const [branch, setBranch] = useState('');
  const [username, setUsername] = useState('');


  const router = useRouter();

  useEffect(() => {
    setBranch(localStorage.getItem('deviceDefaultBranch'));
    let user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      const { EMPLOYEEID, USERNAME } = parsed;

      if (USERNAME && EMPLOYEEID) {
        setUsername(USERNAME)
      }
    }
  }, [])



  return (
    <>
      <AppBar
        position="sticky"
        className="software-header-nav"
      >
        <Toolbar>
          <Typography variant="h4" color="error" component={"div"}>
            <Link className='text-white' href={'/'}>
              Prime laboratory information system
              <span className="text-white">
                || PLS
              </span>
            </Link>
          </Typography>
        </Toolbar>
        <Toolbar className='flow-child'>
          {branch == null ? <button
            onClick={(e) => router.push('/settings')} className="btn btn-dark text-capitalize ">set branch</button> : `${branch}`}
        </Toolbar>
        <Toolbar className='userHeader'>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Avatar sx={{ mr: 1 }} />
            <Typography variant="h6" color='warning' className="text-capitalize" >
              {username}
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default Header;
