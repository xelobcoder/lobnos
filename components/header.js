import { Apps, Login, Logout } from "@mui/icons-material";
import { useContext } from "react";
import AuthContext, { useApplicationSettings } from "./Auth/useApplicationContext";
import { useRouter } from "next/navigation";
import { handleLogout } from "./Auth/customFetch";


function Header() {
  const { user } = useApplicationSettings().applicationsettings;
  const employeeid = user?.employeeid;
  const router = useRouter();


  return (
    <>
      <div className="software-header-nav">
        <ul>
          <span onClick={(ev) => { router.push('/') }}
            className="softfullname text-white pointer col-4">
            Prime laboratory system(PLS)</span>
          <li>
            <span> <Apps /></span>
            <button className='btn btn-light btn-sm'>logout</button>
            <span> {user?.username ? <Logout onClick={(ev) => { handleLogout(employeeid) }} /> : <Login />}</span>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Header;