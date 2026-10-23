'use client';
import { useEffect,useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { customFetch } from '../Auth/customFetch';
import styles from './OperationalControls.module.css';
export default function OrganizationTestServices(){
 const params=useSearchParams(),orgid=params?.get('orgid');const [tests,setTests]=useState<any[]>([]),[search,setSearch]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let alive=true;customFetch('testpanel/list/bulk').then(response=>{if(alive)setTests(Array.isArray(response?.data)?response.data:[]);}).catch(e=>{if(alive)setError(e.message)});return()=>{alive=false};},[]);
 return <section className={styles.panel}><h2>Configure laboratory test services</h2><p>Choose a test to set this partner's agreed cost, turnaround time, validity and preferred-provider status. The test-panel configuration is the shared source for billing and dispatch.</p>{error&&<p role="alert">{error}</p>}{!orgid?<p>Save or select an organization first.</p>:<><label>Find a test<input className="form-control" value={search} onChange={e=>setSearch(e.target.value)} /></label><div className={styles.tableWrap}><table><thead><tr><th>Test</th><th>Action</th></tr></thead><tbody>{tests.filter(t=>String(t.name).toLowerCase().includes(search.toLowerCase())).slice(0,50).map(test=><tr key={test.id}><td>{test.name}</td><td><a className="btn btn-sm btn-outline-primary" href={`/settings/applicationsettings/testpanels/testlist/${test.id}?tab=outsourcing&provider=${orgid}`}>Configure this laboratory</a></td></tr>)}</tbody></table></div><small>Showing up to 50 matching tests. Search to narrow the list.</small></>}</section>;
}
