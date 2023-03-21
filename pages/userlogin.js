import React, { useState, useEffect } from "react";
import Header from "../components/header";
import SidebarFrontPage from "../components/frontpagesidebar";
import { Paper, TextField, Container, Button } from "@mui/material";

export default function USERLOGIN() {
 const [user, setuser] = useState({ username: '', password: "" })

 const [error, setError] = useState(false)
 return (
  <>
   <div>
    <Container>
     {error}
    </Container>
   </div>
   <div className="welcome-page">
    <Container >
     <div >
      <TextField className="login-textfield"
       onChange={(e) => setuser({ ...user, username: e.target.value })}
       label='username' size='small' value={user.username} />
      <TextField className="login-textfield" type='password'
       onChange={(e) => setuser({ ...user, password: e.target.value })}
       label='password' size='small' value={user.password} />
     </div>
     <Button variant='contained' color='primary'>login</Button>
    </Container>
   </div>
  </>
 )
}







USERLOGIN.getLayout = function (page) {
 return (
  <>
   <Header />
   <div>
    {page}
   </div>
  </>
 )
}