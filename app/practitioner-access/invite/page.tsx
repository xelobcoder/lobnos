'use client';
import {useSearchParams} from 'next/navigation';
import PractitionerInvite from '../../../components/Practitioner/PractitionerInvite';
export default function Page(){const params=useSearchParams();return <PractitionerInvite token={params.get('token')||''}/>;}
