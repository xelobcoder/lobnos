import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Apps, Login, Logout } from "@mui/icons-material";
import { useContext } from "react";
import AuthContext from "./Auth/useAuthentification";
import { handleLogout } from "./Auth/customFetch";



function Header() {
  const [branch, setBranch] = useState('');
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    setBranch(localStorage.getItem('deviceDefaultBranch'));
  }, [])


  return (
    <>
      <div className="software-header-nav">
        <ul>
          <Link className="text-white" href={'/'} >
            <span className="softfullname">Prime laboratory system(PLS)</span>
          </Link>
          <li>
            <span> <Apps /></span>
            <span> {auth?.username ? <Logout onClick={ (ev) =>  {handleLogout(ev)}} />  : <Login/>}</span>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Header;

// #5867dd