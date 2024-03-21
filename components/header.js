import React, { useEffect, useState } from "react";
import { Apps, Login, Logout } from "@mui/icons-material";
import { useContext } from "react";
import AuthContext from "./Auth/useAuthentification";
import { handleLogout } from "./Auth/customFetch";
import { useRouter } from "next/navigation";



function Header() {
  const [branch, setBranch] = useState('');
  const { auth } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    setBranch(localStorage.getItem('deviceDefaultBranch'));
  }, [])


  return (
    <>
      <div className="software-header-nav">
        <ul>
          <span onClick={(ev) => { router.push('/') }} className="softfullname text-white pointer col-4">Prime laboratory system(PLS)</span>
          <li>
            <span> <Apps /></span>
            <span> {auth?.username ? <Logout onClick={(ev) => { handleLogout(ev) }} /> : <Login />}</span>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Header;

// #5867dd