import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Apps, Login, Logout, Settings } from "@mui/icons-material";
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
            <span className="softfullname">Prime laboratory system||</span>PLS
          </Link>
          <li><Settings /></li>
          <li className="text-capitalize">
            {auth?.username || ''}
          </li>
          <li>
            <Apps />
          </li>
          {
            auth?.username ?
            <li onClick={(ev) => { handleLogout(ev) }}>
            <Logout /> Logout
              </li> :
              <li>
             <Login/>   signin
              </li>
         }
        </ul>
      </div>
    </>
  );
}

export default Header;

