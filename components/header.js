import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Apps, Logout, Settings } from "@mui/icons-material";
import { useContext } from "react";
import AuthContext from "./Auth/useAuthentification";



function Header() {
  const [branch, setBranch] = useState('');

  const { auth } = useContext(AuthContext);

  useEffect(() => {
    setBranch(localStorage.getItem('deviceDefaultBranch'));
  }, [])


  const handleLogout = async () => {
    await window.cookieStore.delete('X-AUTH-PRIME-LAB-SYSTEMS');
    window.location.reload();
  }


  return (
    <>
      <div className="software-header-nav">
        <ul>
          <Link className="text-white" href={'/'} >Prime laboratory system
            <span className="text-white">
              || PLS
            </span>
          </Link>
          <li><Settings /></li>
          <li className="text-uppercase">
            {auth?.username || ''}
          </li>
          <li>
            <Apps />
          </li>
          <li onClick={(ev) => { handleLogout(ev) }}>
            <Logout /> Logout
          </li>
        </ul>
      </div>
    </>
  );
}

export default Header;

