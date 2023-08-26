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
import { customFetch } from "./Auth/customFetch";



function Header() {
  const [showWidget, setShowWidget] = useState(false);
  const [branch, setBranch] = useState('');

  const handleClickedLink = () => {
    setShowWidget(false);
  }
  const handleClose = () => { setShowWidget(!showWidget); };

  const pageUrl = useRouter().pathname;

  useEffect(() => { setBranch(localStorage.getItem('deviceDefaultBranch')) }, [])


  return (
    <>
      <Box>
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: "#00224f",
            display: "grid",
            padding:'0px',
            gridTemplateColumns: "60% auto auto auto",
          }}
        >
          <Toolbar>
            <Typography variant="h4" color="error" component={"div"}>
              <Link href={'/'}>
                ZOOM
              </Link>
            </Typography>
          </Toolbar>
          <Toolbar>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar sx={{ mr: 1 }} />
              <Typography variant="h6" color='warning mt-3'>
                Glover Agbevia
              </Typography>
            </div>
          </Toolbar>
          <Toolbar>
            <Refresh sx={{ mr: 1, cursor: 'pointer' }} onClick={() => { window.location.reload() }} />
            {branch == '' ? 'ALL BRANCHES' : branch}
          </Toolbar>
          <Toolbar>
            {pageUrl === '/authentication/login' || pageUrl == '/' ? null : (
              <WidgetsIcon
                sx={{ cursor: "pointer" }}
                onClick={(ev) => handleClose()}
              />
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <Box>
        <Widget show={showWidget} handleClickedLink={handleClickedLink} />
      </Box>
    </>
  );
}

export default Header;
