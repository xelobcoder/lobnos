import { Settings, SettingsApplications, Forest, CorporateFareRounded, BloodtypeRounded, TripOrigin, PriceChange } from "@mui/icons-material";
import Link from "next/link";
import { useState } from "react";
export default function SettingsSidebarLayout() {
  const { hideText, setHideText } = useState(false);
  return (
    <>
      <div className="settings-sidebar">
        <div className="contents">
          <ul>
            <li>
              <div className="icons">
                <SettingsApplications />
              </div>
              <div className="text">
                <Link href={'/settings'}> Applications settings</Link>
              </div>
            </li>
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
                <BloodtypeRounded />
              </div>
              <div className="text">
                <Link href={'/settings/setup'}>test setup</Link>
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
                <PriceChange />
              </div>
              <div className="text">
                <Link href={'/settings/testpanel/testpricing'}>test pricing and setup</Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}


