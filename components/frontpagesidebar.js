import Link from 'next/link';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AirplanemodeInactiveIcon from '@mui/icons-material/AirplanemodeInactive';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import ScienceIcon from '@mui/icons-material/Science';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import ResetTvIcon from '@mui/icons-material/ResetTv';
import InventoryIcon from '@mui/icons-material/Inventory';
import BiotechIcon from '@mui/icons-material/Biotech';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
export default function SidebarFrontPage() {
  return (
    <>
      <ul className="frontpagesidebar">
        <li>
          <Link href="/registration">
            <a>
              <HowToRegIcon />
              registration
            </a>
          </Link>
        </li>
        <li>
          <Link href="/activation">
            <a>
              <AirplanemodeInactiveIcon />
              activation
            </a>
          </Link>
        </li>
        <li>
          <Link href="/clients">
            <a>
              <PersonOutlineIcon />
              Clients
            </a>
          </Link>
        </li>
        <li>
          <Link href="/waitinglist">
            <a>
              <HourglassEmptyIcon />
              Waiting list
            </a>
          </Link>
        </li>
        <li>
          <Link href="/results">
            <a>
              <ResetTvIcon />
              Results
            </a>
          </Link>
        </li>
        <li>
          <Link href="/appointments">
            <a>
              <BookOnlineIcon />
              Appointments
            </a>
          </Link>
        </li>
        <li>
          <Link href="/organization">
            <a>
              <CorporateFareIcon />
              organization
            </a>
          </Link>
        </li>
        <li>
          <Link href="/clinician">
            <a>
              <HealthAndSafetyIcon />
              Clinicians
            </a>
          </Link>
        </li>
        <li>
          <Link href="/testpanel">
            <a>
              <BiotechIcon />
              test panel
            </a>
          </Link>
        </li>
        <li>
          <Link href="/sample">
            <a>
              <ScienceIcon />
              sample
            </a>
          </Link>
        </li>
        <li>
          <Link href="/settings">
            <a>
              <SettingsApplicationsIcon />
              settings
            </a>
          </Link>
        </li>
        <li>
          <Link href="/supplier">
            <a>
              <InventoryIcon />
              suppliers
            </a>
          </Link>
        </li>
      </ul>
    </>
  )
}
