"use client";
import { useEffect,useState } from "react";
import {useApplication} from "../Auth/useApplicationContext";
import { accountingApi } from "../../lib/accounting/accountingApi";
export function usePlanningAccess(permission: "expense.create" | "accounting.journal.post") {
 const app=useApplication();
 const [allowed,setAllowed]=useState(false),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;setAllowed(false);setLoading(true);accountingApi.myAuthority().then(response=>{if(active)setAllowed(response?.result?.permissions?.[permission]?.allowed===true);}).catch(()=>{}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[permission,app?.branchid,app?.user?.employeeid,app?.user?.role]);
 return {allowed,loading};
}
export function checked(response:any) { if(response?.status!=="success")throw new Error(response?.message||"The request could not be completed");return response.result; }
