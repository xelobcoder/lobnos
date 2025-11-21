"use client"

import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import AdminExpensesList from "../../../../components/Expense/AdminExpenseListView";
import UnauthorizedAccess from "../../../operations/laboratory/unauthorized/page";

export default function ExpenseListAdmin() {
     const { applicationsettings } = useApplicationSettings();
     const { user, branchid } = applicationsettings;
     const { employeeid, role } = user;
     if (!employeeid) return (
          <div>  <UnauthorizedAccess /> </div>
     )
     return (<><AdminExpensesList branchid={branchid} employeeid={employeeid} /></>)
}


