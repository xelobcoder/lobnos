"use client";
import { useEffect, useState } from 'react';
import { customFetch } from '../../../components/Auth/customFetch';

type Employee = { employeeid: number; username?: string; firstname?: string; lastname?: string; email?: string; role?: string };
export default function PayrollEmployeeFinder({ onSelect }: { onSelect: (employeeId: number) => void }) {
 const [employees, setEmployees] = useState<Employee[]>([]), [query, setQuery] = useState('');
 const [selected, setSelected] = useState(''), [busy, setBusy] = useState(true), [error, setError] = useState('');
 const load = async () => {
  setBusy(true); setError('');
  try { const response = await customFetch('logins');
   if (response?.status !== 'success' || !Array.isArray(response.result)) throw new Error(response?.message || 'Unable to load employees.');
   setEmployees(response.result);
  } catch (failure: any) { setError(failure.message || 'Unable to load employees.'); }
  finally { setBusy(false); }
 };
 useEffect(() => { load(); }, []);
 const name = (employee: Employee) => employee.username || `${employee.firstname || ''} ${employee.lastname || ''}`.trim() || `Employee ${employee.employeeid}`;
 const filtered = employees.filter(employee => `${name(employee)} ${employee.employeeid} ${employee.email || ''}`.toLowerCase().includes(query.trim().toLowerCase()));
 return <div style={{ maxWidth: 620 }}>
  {error ? <div role="alert" className="alert alert-danger">{error} <button type="button" className="btn btn-outline-danger btn-sm" onClick={load}>Retry employees</button></div> : <>
   <label className="form-label">Find an employee<input type="search" aria-label="Find an employee" className="form-control mt-2" placeholder="Search name, employee ID or email" value={query} disabled={busy} onChange={event => { setQuery(event.target.value); setSelected(''); }}/></label>
   {busy ? <p role="status" className="text-muted">Loading employees…</p> : filtered.length === 0 ? <p role="status" className="text-muted">No employees match your search.</p> : <label className="form-label mt-3">Employee<select className="form-select mt-2" aria-label="Employee for payroll report" value={selected} onChange={event => setSelected(event.target.value)}><option value="">Select an employee</option>{filtered.map(employee => <option value={employee.employeeid} key={employee.employeeid}>{name(employee)} · #{employee.employeeid}{employee.role ? ` · ${employee.role}` : ''}</option>)}</select></label>}
   <button type="button" className="btn btn-primary mt-3" disabled={!selected || busy} onClick={() => onSelect(Number(selected))}>Open year-to-date report</button>
  </>}
 </div>;
}
