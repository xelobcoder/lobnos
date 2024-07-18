import React from 'react';
import Link from 'next/link';
import {
  Analytics, AnalyticsTwoTone, AppRegistration, Approval, AppsOutlined,
  Bloodtype, Dashboard, Draw, EmailOutlined, ExploreOff, ImagesearchRoller,
  IntegrationInstructions, Inventory, Person2, ReceiptLongSharp, TrackChanges
} from '@mui/icons-material';

export default function FrontPageAdminView() {
  return (
    <div>
      <ul className='front-page-ui-presentation '>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/registration" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <AppRegistration sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Registration & Billing</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/operations/laboratory" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Bloodtype sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Laboratory Operations</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/operations/imaging/ultrasound" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ImagesearchRoller sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Medical Imaging</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/phelobotomy" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Draw sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Phelobotomy</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/administration/approval" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Approval sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Result Approval</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Dashboard sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Dashboard</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/authentication/users" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Person2 sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Users</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/settings/applicationsettings" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <AppsOutlined sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Application Settings</div>
          </Link>
        </li>
        <li>
          <Link aria-disabled className="bg-primary text-white p-4 text-center" href="/expense/expenseslist" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ExploreOff sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Expenses</div>
          </Link>
        </li>
        <li>
          <Link aria-disabled className="bg-secondary text-white p-4 text-center" href="/upgrade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Inventory sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Inventory Management</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/supplier" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ReceiptLongSharp sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Purchase Management</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/upgrade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Analytics sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Result Analysis</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/email" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <EmailOutlined sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Email Services</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/doctor" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <TrackChanges sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>{"Doctor's Portal"}</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/clients" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <AnalyticsTwoTone sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>{"Patient's Portal"}</div>
          </Link>
        </li>
        <li>
          <Link className="bg-secondary text-white p-4 text-center" href="/instructions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <IntegrationInstructions sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Instructions</div>
          </Link>
        </li>
      </ul>
    </div>
  );
}
