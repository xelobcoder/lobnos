import { Apps, Login, Logout } from "@mui/icons-material";
import { useContext } from "react";
import AuthContext from "./Auth/useAuthentification";
import { useRouter } from "next/navigation";
import { handleLogout } from "./Auth/customFetch";


function Header() {
  const { auth } = useContext(AuthContext);
  const employeeid = auth?.employeeid;
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
            <span> {auth?.username ? <Logout onClick={(ev) => { handleLogout(employeeid)}} /> : <Login />}</span>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Header;