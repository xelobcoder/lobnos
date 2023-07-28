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
       
       </div>
       <div className="text">
        <Link href={'/settings'}>  settings</Link>
       </div>
      </li>
      <li>
       <div className="icons">
       
       </div>
       <div className="text">
        <Link href={'/settings/branches'}>
         branches
        </Link>
       </div>
      </li>
      <li>
       <div className="icons">
        
       </div>
       <div className="text">
        <Link href={'/settings/companyprofile'}>company info</Link>
       </div>
      </li>
      <li>
       <div className="icons">
       
       </div>
       <div className="text">
        <Link href={'/settings/setup'}>test setup</Link>
       </div>
      </li>
      <li>
       <div className="icons">
        
       </div>
       <div className="text">
        <Link href={'/settings/department'}>add department</Link>
       </div>
      </li>
     </ul>
    </div>
   </div>
  </>
 )
}


