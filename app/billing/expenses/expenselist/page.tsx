"use client"

import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import AdminExpensesList from "../../../../components/Expense/AdminExpenseListView";

export default function ExpenseListAdmin() {
     const { applicationsettings } = useApplicationSettings();
     const { user, branchid } = applicationsettings;
     const { employeeid, role } = user;
     if (!employeeid) return null
     return (<><AdminExpensesList branchid={branchid} employeeid={employeeid} /></>)
}


