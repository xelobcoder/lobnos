import {
      AssignmentInd,
      VerifiedUser,
      MonetizationOn,
      Person,
      Event,
      Business,
      SupervisorAccount,
      ViewArray,
      ShoppingBagRounded,
      Menu,
      Close
} from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';
import ClinicianGeneralSalesChart from '../components/Dashboards/ClinicianGeneralSales';

export default function SideBarPractive() {
      const [show, setShow] = useState(false);

      const sideLinks = [
            { title: 'registration', link: '/registration', icon: <AssignmentInd /> },
            { title: 'patient search', link: "/patientsearch", icon: <VerifiedUser /> },
            { title: 'billing', link: "/billing/payment", icon: <MonetizationOn /> },
            { title: 'sales summary', link: "/billing/salessummary", icon: <MonetizationOn /> },
            { title: 'orders', link: '/orders', icon: <ShoppingBagRounded /> },
            { title: 'Clients', link: '/patients', icon: <Person /> },
            { title: 'Appointments', link: '/appointments', icon: <Event /> },
            { title: 'Organization', link: '/organization', icon: <Business /> },
            { title: 'Clinicians', link: '/clinician', icon: <SupervisorAccount /> },
            { title: 'Result', link: '/registration/ready', icon: <ViewArray /> }
      ];
      return (
            <>
                  <header className='bg-secondary'>
                        <Menu

                              onClick={(ev) => { setShow(!show); }} className='border m-1 br-5 bg-secondary text-white' fontSize='large' />
                  </header>
                  <main className='d-flex'>

                        <div>

                              <ClinicianGeneralSalesChart clinicianid={3} />
                        </div>
                        <div className='sidebarr' style={{ left: show ? "0px" : '-250px' }}>
                              <header>Prime lab system
                                    <Close fontSize='medium'
                                          onClick={(ev) => { setShow(false); }}
                                          className='border border-danger text-danger' /></header>
                              <ul>
                                    {sideLinks.map((item, index) => {
                                          return <li key={index}>
                                                <Link href={item.link}>
                                                      {item.icon}{item.title}</Link>
                                          </li>;
                                    })}
                              </ul>
                        </div>
                  </main></>
      )
}