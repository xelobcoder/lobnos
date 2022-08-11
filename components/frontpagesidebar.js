import Link from 'next/link';
export default function SidebarFrontPage() {
    return(
       <>
         <ul className="frontpagesidebar">
            <li><Link href='/registration'><a>registration</a></Link></li>
            <li><Link href='/registration/clients'><a>Clients</a></Link></li>
            <li><Link href='/registration/waitinglist'><a>Waiting list</a></Link></li>   
            <li><Link href='/registration/results'><a>Results</a></Link></li>
            <li><Link href='/registration/appointments'><a>Appointments</a></Link></li>
            <li><Link href='/registration/organization'><a>organization</a></Link></li>
            <li><Link href='/registration/clinician'>Clinicians</Link></li>
            <li><Link href='/registration/testpanel'><a>test panel</a></Link></li>
         </ul>
       </>
    )
}