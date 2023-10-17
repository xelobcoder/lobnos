import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Apps, Settings } from "@mui/icons-material";
import { useContext } from "react";
import AuthContext from "./Auth/useAuthentification";



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
          <Link className="text-white" href={'/'} >Prime laboratory system
            <span className="text-white">
              || PLS
            </span>
          </Link>
          <li><Settings/></li>
          <li>
            {auth?.username || ''}
          </li>
          <li>
            <Apps />
          </li>
        </ul>
      </div>
    </>
  );
}

export default Header;

{/* <Typography variant="h4" color="error" component={"div"}>
            <Link className='text-white' href={'/'}>
              Prime laboratory information system
              <span className="text-white">
                || PLS
              </span>
            </Link>
          </Typography> */}

{/* <Toolbar className='flow-child'>
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
        </Toolbar> */}