'use client';
import PatientFiltered from '../accessories/SectorFileringComponents/CustomerFiltering';
import VitalSigns from '../Practitioner/VitalSigns';
import {useState} from 'react';
export default function Form({searchParams}:{searchParams:any}){const [patientid,setPatientid]=useState(Number(searchParams?.patientid)||0);return <div>{!patientid?<PatientFiltered isDisabled={false} getSelectedPatient={(p:any)=>setPatientid(Number(p.patientid))}/>:<VitalSigns key={patientid} patientid={patientid}/>}</div>;}
