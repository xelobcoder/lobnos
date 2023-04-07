import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import React from "react";
import WidgetsIcon from "@mui/icons-material/Widgets";
import Widget from "./Headers/Widget";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";


function Header() {
  const [showWidget, setShowWidget] = React.useState(false);
  console.log(showWidget)

  const handleClickedLink = () => {
    setShowWidget(false);
  }
  const handleClose = () => { setShowWidget(!showWidget); };



  const pageUrl = useRouter().pathname;
  return (
    <>
      <Box className="software_header">
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: "#00224f",
            display: "grid",
            gridTemplateColumns: "92% auto",
          }}
        >
          <Toolbar>
            <Typography variant="h4" color="inherit" component={"div"}>
              <Link href={'/'}>
                LIMS
              </Link>
            </Typography>
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
