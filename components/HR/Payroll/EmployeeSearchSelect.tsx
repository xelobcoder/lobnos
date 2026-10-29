"use client";
import { useState, type SelectHTMLAttributes } from 'react';
type Employee = { employeeid: number | string; username?: string; role?: string; firstname?: string; lastname?: string };
export default function EmployeeSearchSelect({ employees, ...props }: Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & { employees: Employee[] }) {
 const [query, setQuery] = useState('');
 const name = (employee: Employee) => employee.username || `${employee.firstname || ''} ${employee.lastname || ''}`.trim() || `Employee ${employee.employeeid}`;
 const rows = employees.filter(employee => String(employee.employeeid) === String(props.value) || `${name(employee)} ${employee.employeeid} ${employee.role || ''}`.toLowerCase().includes(query.trim().toLowerCase()));
 return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8,minWidth:0}}>
  <input type="search" data-payroll-transient aria-label="Search employees by name or ID" className="form-control" placeholder="Search name or employee ID" value={query} disabled={props.disabled} onChange={event=>setQuery(event.target.value)}/>
  <select {...props} aria-label={props['aria-label'] || 'Employee'}><option value="">{props.disabled ? 'Loading employees…' : rows.length ? 'Select an employee' : 'No matching employees'}</option>{rows.map(employee=><option key={employee.employeeid} value={employee.employeeid}>{name(employee)} · #{employee.employeeid}{employee.role ? ` · ${employee.role}` : ''}</option>)}</select>
 </div>;
}
