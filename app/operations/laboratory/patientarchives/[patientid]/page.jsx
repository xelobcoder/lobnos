'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { plsDecryption } from '../../../../../lib/encryption';
import PatientArchivesWorkspace from '../../../../../components/operations/PatientArchivesWorkspace';
export default function PatientSpecificArchivesCases(){
    const params=useParams(),search=useSearchParams();let patientId='';
    try{patientId=String(plsDecryption(String(params?.patientid||''))||'')}catch{ /* Invalid references never fall back to the global archive. */ }
    return <PatientArchivesWorkspace patientId={patientId} patientName={search.get('fullname')||''}/>;
}
