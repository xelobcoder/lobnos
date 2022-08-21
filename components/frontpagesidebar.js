import Link from 'next/link';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'
export default function SidebarFrontPage() {
  return (
    <>
      <ul className="frontpagesidebar">
        <li>
          <Link href="/registration">
            <a>registration</a>
          </Link>
        </li>
        <li>
          <Link href="/activation">
            <a>activation</a>
          </Link>
        </li>
        <li>
          <Link href="/clients">
            <a>Clients</a>
          </Link>
        </li>
        <li>
          <Link href="/waitinglist">
            <a>Waiting list</a>
          </Link>
        </li>
        <li>
          <Link href="/results">
            <a>Results</a>
          </Link>
        </li>
        <li>
          <Link href="/appointments">
            <a>Appointments</a>
          </Link>
        </li>
        <li>
          <Link href="/organization">
            <a>organization</a>
          </Link>
        </li>
        <li>
          <Link href="/clinician">Clinicians</Link>
        </li>
        <li>
          <Link href="/testpanel">
            <a>test panel</a>
          </Link>
        </li>
      </ul>
    </>
  )
}
