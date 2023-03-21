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
            <HowToRegIcon />
            registration
          </Link>
        </li>
        <li>
          <Link href="/activation">
            <AirplanemodeInactiveIcon />
            activation
          </Link>
        </li>
        <li>
          <Link href="/clients">
            <PersonOutlineIcon />
            Clients
          </Link>
        </li>
        <li>
          <Link href="/waitinglist">
            <HourglassEmptyIcon />
            Waiting list
          </Link>
        </li>
        <li>
          <Link href="/results">
            <ResetTvIcon />
            Results
          </Link>
        </li>
        <li>
          <Link href="/appointments">
            <BookOnlineIcon />
            Appointments
          </Link>
        </li>
        <li>
          <Link href="/organization">
            <CorporateFareIcon />
            organization
          </Link>
        </li>
        <li>
          <Link href="/clinician">
            <HealthAndSafetyIcon />
            Clinicians
          </Link>
        </li>
        <li>
          <Link href="/testpanel">
            <BiotechIcon />
            test panel
          </Link>
        </li>
        <li>
          <Link href="/sample">
            <ScienceIcon />
            sample
          </Link>
        </li>
        <li>
          <Link href="/settings">
            <SettingsApplicationsIcon />
            settings
          </Link>
        </li>
        <li>
          <Link href="/supplier">
            <InventoryIcon />
            suppliers
          </Link>
        </li>
      </ul>
    </>
  )
}
