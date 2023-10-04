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
import WidgetsIcon from "@mui/icons-material/Widgets";
import Widget from "./Headers/Widget";
import Link from "next/link";
import { useRouter } from "next/router";
import { Refresh } from "@mui/icons-material";



function Header() {
  const [showWidget, setShowWidget] = useState(false);
  const [branch, setBranch] = useState('');
  const [username, setUsername] = useState('');

  const handleClickedLink = () => {
    setShowWidget(false);
  }
  const handleClose = () => { setShowWidget(!showWidget); };

  const pageUrl = useRouter().pathname;

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
      <Box>
        <AppBar
          position="sticky"
          className="software-header-nav"
        >
          <Toolbar>
            <Typography variant="h4" color="error" component={"div"}>
              <Link href={'/'}>
                HPLIMS
                <span className="text-white">(High performance laboratory information management system) || prime health</span>
              </Link>
            </Typography>
          </Toolbar>
          <Toolbar className='userHeader'>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar sx={{ mr: 1 }} />
              <Typography variant="h6" color='warning' className="text-capitalize" >
                {username}
              </Typography>
            </div>
          </Toolbar>
          <Toolbar className='flow-child'>
            <Refresh sx={{ mr: 1, cursor: 'pointer' }} onClick={() => { window.location.reload() }} />
            {branch == null ? <button
              onClick={(e) => router.push('/settings')} className="btn btn-dark text-capitalize ">set branch</button> : branch}
          </Toolbar>
          <Toolbar>
            {pageUrl === '/authentication/login' || pageUrl == '/' ? null : (
              <WidgetsIcon
                sx={{ cursor: "pointer" }}
                onClick={(ev) => handleClose()}
              />
            )}
          </Toolbar>
          {/* {status == 'authenticated' &&
            <Toolbar>
              <button onClick={(e) => { signOut() }} className="custom-button text-white">
                signout
              </button>
            </Toolbar>}
          {
            status === 'unauthenticated' &&
            <Toolbar>
              <button onClick={(e) => { signIn() }} className="custom-button text-white">
                signIn
              </button>
            </Toolbar>

          } */}
        </AppBar>
      </Box>
      <Box>
        <Widget show={showWidget} handleClickedLink={handleClickedLink} />
      </Box>
    </>
  );
}

export default Header;
