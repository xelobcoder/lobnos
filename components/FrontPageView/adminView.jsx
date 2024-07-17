import React from 'react'
import Link from 'next/link';
import { Analytics, AnalyticsTwoTone, AppRegistration, Approval, AppsOutlined, Bloodtype, Dashboard, Draw, EmailOutlined, ExploreOff, ImagesearchRoller, IntegrationInstructions, Inventory, Person2, ReceiptLongSharp, TrackChanges } from '@mui/icons-material';

export default function FrontPageAdminView() {
  return (
    <div>
      <ul style={{ display: "grid", gridTemplateColumns: "30% 30% 30%", gridGap: "20px" }}>
        <Link className="  bg-primary text-white p-4 text-center" href="/registration">
          <AppRegistration sx={{ height: 100, width: 100 }} />
          Registration & Billing
        </Link>
         
        <Link className="bg-primary p-4  text-white text-center" href="/operations/laboratory">
          <Bloodtype sx={{ height: 100, width: 100 }} />
          Laboratory Operations
        </Link>
        <Link className="bg-primary p-4  text-white text-center" href="/operations/imaging/ultrasound">
          <ImagesearchRoller sx={{ height: 100, width: 100 }} />
          Medical Imaging
        </Link>
        <Link className="bg-primary p-4  text-white text-center" href="/phelobotomy">
          <Draw sx={{ height: 100, width: 100 }} />
          Phelobotomy
        </Link>
        <Link className="bg-primary p-4  text-white text-center" href="/administration/approval">
          <Approval sx={{ height: 100, width: 100 }} />
          Result Approval
        </Link>
        <Link className="bg-primary p-4  text-white text-center" href="/dashboard">
          <Dashboard sx={{ height: 100, width: 100 }} />
          DashBoard
        </Link>
        <Link className="bg-primary p-4  text-white text-center" href="/authentication/users">
          <Person2 sx={{ height: 100, width: 100 }} />
          Users
        </Link>
        <Link className="bg-primary p-4  text-white text-center" href="/settings/applicationsettings">
          <AppsOutlined sx={{ height: 100, width: 100 }} />
          Application Settings
        </Link>
        <Link aria-disabled className="bg-primary p-4  text-white text-center" href="/expense/expenseslist">
          <ExploreOff sx={{ height: 100, width: 100 }} />
          Expenses
        </Link>
        <Link aria-disabled className="bg-secondary p-4  text-white text-center" href="/upgrade">
          <Inventory sx={{ height: 100, width: 100 }} />
          Inventory Mangement
        </Link>
        <Link className="bg-primary p-4  text-white text-center" href="/supplier">
          <ReceiptLongSharp sx={{ height: 100, width: 100 }} />
          Purchase Mangement
        </Link>
        <Link className="bg-primary p-4  text-white text-center" href="/upgrade">
          <Analytics sx={{ height: 100, width: 100 }} />
          Result Analysis
        </Link>
        <Link className="bg-primary p-4  text-white text-center" href="/email">
          <EmailOutlined sx={{ height: 100, width: 100 }} />
          Email Services
        </Link>
        <Link className="bg-primary p-4  text-white text-center" href="/doctor">
          <TrackChanges sx={{ height: 100, width: 100 }} />
          {" Doctor's"} Portal
        </Link>
        <Link className="bg-primary p-4  text-white text-center" href="/clients">
          <AnalyticsTwoTone sx={{ height: 100, width: 100 }} />
          {" Patient's"} Portal
        </Link>
        <Link className="bg-secondary p-4  text-white text-center" href="/instructions">
          <IntegrationInstructions sx={{ height: 100, width: 100 }} />
          Instructions
        </Link>
      </ul>
    </div>
  );
}
