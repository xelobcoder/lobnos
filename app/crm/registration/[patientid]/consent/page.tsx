"use client";
import {useParams,useSearchParams} from 'next/navigation';
import EConsentWorkspace from '../../../../../components/registration/EConsentWorkspace';
export default function Page(){const params=useParams(),query=useSearchParams();return <EConsentWorkspace patientid={Number(params?.patientid)} ascensionid={query?.get('ascensionid')?Number(query.get('ascensionid')):undefined}/>;}
