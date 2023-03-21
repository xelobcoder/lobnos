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

function Header() {
  const [showWidget, setShowWidget] = React.useState(false);
  console.log(showWidget)

  const handleClickedLink = () => {
    setShowWidget(false);
  }
  const handleClose = () => { setShowWidget(!showWidget); };
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
              LIMS
            </Typography>
          </Toolbar>
          <Toolbar>
            <WidgetsIcon
              sx={{ cursor: "pointer" }}
              onClick={(ev) => handleClose()}
            />
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
