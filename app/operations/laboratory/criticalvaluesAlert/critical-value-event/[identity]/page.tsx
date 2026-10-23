'use client';
import { useEffect,useState } from 'react';
import { useParams,useRouter } from 'next/navigation';
import { controlApi } from '../../../../../../components/operations/OperationalControlsWorkspace';
export default function Page(){const params=useParams();const router=useRouter();const [error,setError]=useState('');useEffect(()=>{let alive=true;controlApi('critical/legacy/'+params?.identity).then(row=>{if(alive)router.replace('/operations/laboratory/criticalvaluesAlert?event='+row.id);}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[params?.identity,router]);return <div className="p-4">{error?<p role="alert">{error}</p>:<p>Opening critical-result review...</p>}</div>;}
