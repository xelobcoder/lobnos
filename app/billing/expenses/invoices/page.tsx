"use client"

import { useApplication, useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import UnauthorizedAccess from "../../../operations/laboratory/unauthorized/page";
import InvoiceList from "../../../../components/Expense/InvoiceListComponent";

export default function InvoiceListPage() {
    const context = useApplication();
    const employeeid = context?.user?.employeeid || null;
    const branchid = context?.branchid || null;
     if (!employeeid) {
          return <UnauthorizedAccess /> 
     }
     return (<><InvoiceList branchid={branchid} employeeid={employeeid} /></>)
}