import { SettingsApplications, Forest, CorporateFareRounded, BloodtypeRounded, TripOrigin, PriceChange, Sms, Add, TextSnippetRounded, Looks3Sharp } from "@mui/icons-material";
import Link from "next/link";
import { useContext } from "react";
import AuthContext from "../Auth/useAuthentification";

export default function SettingsSidebarLayout() {
  const { auth } = useContext(AuthContext);
  const { role, email, username } = auth;
  return ( 
    <>
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
                <SettingsApplications />
              </div>
              <div className="text">
                <Link href={'/settings/applicationsettings'}> Applications settings</Link>
              </div>
            </li>
            {/* <li>
              <div className="icons">
                <Add />
              </div>
              <div className="text">
                <Link href={'/settings/branches/new'}> Add Branch</Link>
              </div>
            </li> */}
            <li>
              <div className="icons">
                <Forest />
              </div>
              <div className="text">
                <Link href={'/settings/branches'}>
                  branches
                </Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <CorporateFareRounded />
              </div>
              <div className="text">
                <Link href={'/settings/companyprofile'}>company info</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <TripOrigin />
              </div>
              <div className="text">
                <Link href={'/settings/department'}>departments</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <Looks3Sharp />
              </div>
              <div className="text">
                <Link href={'/settings/tax'}>taxes</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <BloodtypeRounded />
              </div>
              <div className="text">
                <Link href={'/settings/setup'}>test setup</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <TextSnippetRounded />
              </div>
              <div className="text">
                <Link href={'/settings/testpanel'}>Test panels</Link>
              </div>
            </li>
            <li>
              <div className="icons">
                <PriceChange />
              </div>
              <div className="text">
                <Link href={'/settings/testpanel/testpricing'}>bulk test update</Link>
              </div>
            </li>
            {/* <li>
              <div className="icons">
                <Sms />
              </div>
              <div className="text">
                <Link href={'/settings/sms'}>
                  sms settings
                </Link>
              </div>
            </li> */}
            <li>
              <div className="icons">
                <Sms />
              </div>
              <div className="text">
                <Link href={'/settings/emailsetting'}>
                  Email Management
                </Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}


