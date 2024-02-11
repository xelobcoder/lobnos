import Link from 'next/link'
import {
  Science,
  LocalHospital,
  History,
  Home,
  Dangerous,
} from "@mui/icons-material";
export default function LabSideBarComponents({ auth }) {
  const {username,role} = auth
  return (
    <div className="settings-sidebar">
       <div className='head'>
        <Link  href={'/'} >
            PLS
          </Link>
        </div>
        <div className='user'>
          <span>{username}({role})</span>
        </div>
      <div className="contents">
        <ul>
          <li>
            <div className="icons">
              <Home />
            </div>
            <div className="text">
              <Link href="/operations/laboratory">operations</Link>
            </div>
          </li>
          <li>
            <div className="icons">
              <History />
            </div>
            <div className="text">
              <Link href="/operations/enteredresult">archive results</Link>
            </div>
          </li>
          <li>
            <div className="icons">
              <LocalHospital />
            </div>
            <div className="text">
              <Link href="/phelobotomy">Phelobotomy</Link>
            </div>
          </li>
          <li>
            <div className="icons">
              <Science />
            </div>
            <div className="text">
              <Link href="/sample">sample validation</Link>
            </div>
          </li>
          <li>
            <div className="icons">
              <Dangerous />
            </div>
            <div className="text">
              <Link href="/sample/rejected">rejected samples</Link>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
