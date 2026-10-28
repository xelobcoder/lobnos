"use client";
import React from "react";
import Link from "next/link";
import { usePlanningAccess } from "../../../components/accounting/usePlanningAccess";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import InvoiceList from "../../../components/Expense/InvoiceListComponent";
export default function AccountingBills(){const app=useApplication(),access=usePlanningAccess('expense.create');if(!app?.user?.employeeid||!app?.branchid)return <div className="container-fluid py-4"><p role="status">Select your active branch to review bills.</p></div>;return <InvoiceList branchid={app.branchid} employeeid={app.user.employeeid} heading="Bills & payments" extraActions={<>{access.allowed&&<Link className="btn btn-primary" href="/billing/expenses/create-new-expense">Add expense for approval</Link>}<Link className="btn btn-outline-secondary" href="/billing/expenses/awaiting-approval">Approval queue</Link></>}/>;}
