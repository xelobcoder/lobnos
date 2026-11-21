"use client";
import {useState} from 'react';
import {useRouter} from 'next/navigation';
export default function Page(){const [patient,setPatient]=useState('');const router=useRouter();return <main className="container py-4"><h1 className="h3">Electronic consent</h1><p>Open e-consent from a patient’s registration record or laboratory visit, or enter the patient ID below.</p><form onSubmit={e=>{e.preventDefault();router.push(`/crm/registration/${Number(patient)}/consent`);}}><label>Patient ID<input className="form-control my-2" type="number" min="1" required value={patient} onChange={e=>setPatient(e.target.value)}/></label><button className="btn btn-primary d-block">Open patient consent</button></form></main>;}
